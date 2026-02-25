// IndexedDB工具类 - 用于前端数据存储
class IndexedDB {
  constructor(dbName = 'RedPacketDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  // 打开数据库连接
  async open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      // 创建或升级数据库结构
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建红包记录存储
        if (!db.objectStoreNames.contains('redPackets')) {
          const store = db.createObjectStore('redPackets', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          
          // 创建索引以便查询
          store.createIndex('amount', 'amount', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('year', 'year', { unique: false });
          store.createIndex('user', 'user', { unique: false });
        }
        
        // 创建用户存储
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          userStore.createIndex('username', 'username', { unique: true });
        }
      };
    });
  }

  // 添加红包记录
  async addRedPacket(redPacket) {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['redPackets'], 'readwrite');
      const store = transaction.objectStore('redPackets');
      
      // 添加年份信息
      const record = {
        ...redPacket,
        createdAt: new Date().toISOString(),
        year: new Date().getFullYear()
      };
      
      const request = store.add(record);
      
      request.onsuccess = () => resolve({ id: request.result, ...record });
      request.onerror = () => reject(request.error);
    });
  }

  // 获取所有红包记录
  async getAllRedPackets(year = null) {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['redPackets'], 'readonly');
      const store = transaction.objectStore('redPackets');
      const request = store.getAll();
      
      request.onsuccess = () => {
        let records = request.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        if (year) {
          records = records.filter(record => record.year === year);
        }
        
        resolve(records);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // 获取总金额
  async getTotalAmount(year = null) {
    const records = await this.getAllRedPackets(year);
    return records.reduce((sum, record) => sum + record.amount, 0);
  }

  // 按用户统计收入
  async getIncomeRanking(year = null) {
    const records = await this.getAllRedPackets(year);
    
    const userStats = {};
    records.forEach(record => {
      const user = record.user || '默认用户';
      if (!userStats[user]) {
        userStats[user] = { user, total: 0, count: 0 };
      }
      userStats[user].total += record.amount;
      userStats[user].count += 1;
    });
    
    return Object.values(userStats)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // 只显示前10名
  }

  // 统计不同面额红包的数量分布
  async getAmountDistribution(year = null) {
    const records = await this.getAllRedPackets(year);
    
    const distribution = {};
    records.forEach(record => {
      const amount = record.amount;
      if (!distribution[amount]) {
        distribution[amount] = { amount, count: 0, total: 0 };
      }
      distribution[amount].count += 1;
      distribution[amount].total += amount;
    });
    
    // 按金额大小排序
    return Object.values(distribution)
      .sort((a, b) => b.amount - a.amount)
      .map(item => ({
        ...item,
        percentage: records.length > 0 ? Math.round((item.count / records.length) * 100) : 0
      }));
  }

  // 获取所有年份
  async getAvailableYears() {
    const records = await this.getAllRedPackets();
    const years = [...new Set(records.map(record => record.year))];
    return years.sort((a, b) => b - a);
  }

  // 删除所有记录
  async clearAllRecords() {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['redPackets'], 'readwrite');
      const store = transaction.objectStore('redPackets');
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // 删除特定年份的记录
  async clearYearRecords(year) {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['redPackets'], 'readwrite');
      const store = transaction.objectStore('redPackets');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const records = request.result;
        const deletePromises = records
          .filter(record => record.year === year)
          .map(record => store.delete(record.id));
        
        Promise.all(deletePromises).then(resolve).catch(reject);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // 删除单条记录
  async deleteRedPacket(id) {
    if (!this.db) await this.open();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['redPackets'], 'readwrite');
      const store = transaction.objectStore('redPackets');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// 创建全局实例
export const db = new IndexedDB();

export default IndexedDB;