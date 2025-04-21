const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  // 验证哈希是否正确
  const isValid = await bcrypt.compare(password, hash);
  console.log('Hash is valid:', isValid);
}

generateHash();