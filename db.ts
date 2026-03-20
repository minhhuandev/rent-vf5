import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbPath = path.join(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS content (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    rating INTEGER,
    comment TEXT,
    avatarUrl TEXT
  );

  CREATE TABLE IF NOT EXISTS rentals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customerName TEXT,
    phoneNumber TEXT,
    idCard TEXT,
    startDate TEXT,
    endDate TEXT,
    totalPrice INTEGER,
    status TEXT,
    notes TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', hash);
}

// Insert default content if not exists
const defaultContent = {
  banner: JSON.stringify({
    title: 'Cho Thuê Xe VinFast VF5',
    subtitle: 'Trải nghiệm xe điện gia đình êm ái, tiết kiệm',
    imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=2070&auto=format&fit=crop',
    ctaText: 'Gọi Ngay',
  }),
  intro: JSON.stringify({
    title: 'Về Chiếc Xe Của Chúng Tôi',
    description: 'Xe gia đình, luôn được vệ sinh sạch sẽ và bảo dưỡng định kỳ. Mang lại cảm giác an tâm tuyệt đối cho mọi chuyến đi của bạn. Không cần thủ tục rườm rà, liên hệ trực tiếp để nhận xe nhanh chóng.',
  }),
  features: JSON.stringify([
    { icon: 'Zap', title: 'Xe điện tiết kiệm', description: 'Chi phí sạc rẻ hơn xăng rất nhiều' },
    { icon: 'Users', title: '5 chỗ ngồi', description: 'Rộng rãi cho gia đình nhỏ' },
    { icon: 'Car', title: 'Êm ái, dễ lái', description: 'Vận hành mượt mà, không tiếng ồn' },
    { icon: 'Wind', title: 'Điều hòa mát lạnh', description: 'Hệ thống làm mát nhanh chóng' },
    { icon: 'Monitor', title: 'Màn hình giải trí', description: 'Kết nối thông minh Apple CarPlay/Android Auto' },
    { icon: 'ShieldCheck', title: 'An toàn cao', description: 'Trang bị nhiều tính năng an toàn chủ động' },
  ]),
  specs: JSON.stringify({
    name: 'VinFast VF5 Plus',
    type: 'SUV Điện',
    seats: '5 Chỗ',
    range: '300km/lần sạc',
  }),
  pricing: JSON.stringify({
    daily: '800,000',
    weekly: '5,000,000',
    monthly: '18,000,000',
    note: 'Cọc 15 triệu hoặc xe máy + giấy tờ. Phí phát sinh: 100k/giờ quá giờ, 5k/km quá giới hạn.',
  }),
  contact: JSON.stringify({
    phone: '0901234567',
    zalo: '0901234567',
    address: '123 Đường ABC, Quận XYZ, TP.HCM',
  })
};

const insertContent = db.prepare('INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)');
for (const [key, value] of Object.entries(defaultContent)) {
  insertContent.run(key, value);
}

export default db;
