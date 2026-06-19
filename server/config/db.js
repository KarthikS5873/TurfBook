const mongoose = require('mongoose');
const District = require('../models/District');
const User = require('../models/User');

let mongoServer;

// Seeder data direct load list
const districtsData = [
  { name: 'Ariyalur', cities: ['Ariyalur', 'Jayankondam', 'Sendurai', 'Andimadam'] },
  { name: 'Chengalpattu', cities: ['Chengalpattu', 'Tambaram', 'Pallavaram', 'Chromepet', 'Mahabalipuram', 'Vandalur', 'Kelambakkam'] },
  { name: 'Chennai', cities: ['Adyar', 'Anna Nagar', 'Nungambakkam', 'T Nagar', 'Velachery', 'Mylapore', 'Guindy', 'Besant Nagar', 'Ambattur'] },
  { name: 'Coimbatore', cities: ['Coimbatore', 'Pollachi', 'Mettupalayam', 'Singanallur', 'Peelamedu', 'Vadavalli', 'Saravanampatti'] },
  { name: 'Cuddalore', cities: ['Cuddalore', 'Chidambaram', 'Panruti', 'Neyveli', 'Vriddhachalam'] },
  { name: 'Dharmapuri', cities: ['Dharmapuri', 'Harur', 'Pennagaram', 'Palacode'] },
  { name: 'Dindigul', cities: ['Dindigul', 'Kodaikanal', 'Palani', 'Oddanchatram', 'Natham'] },
  { name: 'Erode', cities: ['Erode', 'Gobichettipalayam', 'Bhavani', 'Perundurai', 'Sathy'] },
  { name: 'Kallakurichi', cities: ['Kallakurichi', 'Sankarapuram', 'Chinnasalem', 'Ulundurpet'] },
  { name: 'Kanchipuram', cities: ['Kanchipuram', 'Sriperumbudur', 'Walajabad', 'Kundrathur'] },
  { name: 'Kanyakumari', cities: ['Nagercoil', 'Kanyakumari', 'Marthandam', 'Thuckalay', 'Colachel'] },
  { name: 'Karur', cities: ['Karur', 'Kulithalai', 'Aravakurichi', 'Velur'] },
  { name: 'Krishnagiri', cities: ['Krishnagiri', 'Hosur', 'Pochampalli', 'Uthangarai'] },
  { name: 'Madurai', cities: ['Madurai', 'Melur', 'Thirumangalam', 'Vadipatti', 'Usilampatti'] },
  { name: 'Mayiladuthurai', cities: ['Mayiladuthurai', 'Sirkazhi', 'Tharangambadi', 'Kuthalam'] },
  { name: 'Nagapattinam', cities: ['Nagapattinam', 'Velankanni', 'Vedaranyam', 'Thirukkuvalai'] },
  { name: 'Namakkal', cities: ['Namakkal', 'Rasipuram', 'Tiruchengode', 'Komarapalayam'] },
  { name: 'Nilgiris', cities: ['Ooty', 'Coonoor', 'Gudalur', 'Kotagiri'] },
  { name: 'Perambalur', cities: ['Perambalur', 'Kunnam', 'Veppanthattai'] },
  { name: 'Pudukkottai', cities: ['Pudukkottai', 'Aranthangi', 'Illuppur', 'Alangudi'] },
  { name: 'Ramanathapuram', cities: ['Ramanathapuram', 'Rameswaram', 'Paramakudi', 'Keezhakarai'] },
  { name: 'Ranipet', cities: ['Ranipet', 'Arcot', 'Walajapet', 'Arakkonam', 'Sholinghur'] },
  { name: 'Salem', cities: ['Salem', 'Attur', 'Mettur', 'Omalur', 'Edappadi', 'Yercaud'] },
  { name: 'Sivaganga', cities: ['Sivaganga', 'Karaikudi', 'Devakottai', 'Manamadurai'] },
  { name: 'Tenkasi', cities: ['Tenkasi', 'Sengottai', 'Kadayanallur', 'Sankarankovil', 'Alangulam'] },
  { name: 'Thanjavur', cities: ['Thanjavur', 'Kumbakonam', 'Pattukkottai', 'Orathanadu'] },
  { name: 'Theni', cities: ['Theni', 'Bodinayakanur', 'Cumbum', 'Periyakulam', 'Andipatti'] },
  { name: 'Thoothukudi', cities: ['Thoothukudi', 'Kovilpatti', 'Tiruchendur', 'Kayalpattinam'] },
  { name: 'Tiruchirappalli', cities: ['Trichy', 'Srirangam', 'Lalgudi', 'Manapparai', 'Thuraiyur'] },
  { name: 'Tirunelveli', cities: ['Tirunelveli', 'Palayamkottai', 'Ambasamudram', 'Valliyur'] },
  { name: 'Tirupathur', cities: ['Tirupathur', 'Vaniyambadi', 'Ambur', 'Natrampalli'] },
  { name: 'Tiruppur', cities: ['Tiruppur', 'Dharapuram', 'Avinashi', 'Palladam', 'Udumalaipettai'] },
  { name: 'Tiruvallur', cities: ['Tiruvallur', 'Avadi', 'Poonamallee', 'Redhills', 'Gummidipoondi'] },
  { name: 'Tiruvannamalai', cities: ['Tiruvannamalai', 'Arani', 'Cheyyar', 'Polur', 'Chengam'] },
  { name: 'Tiruvarur', cities: ['Tiruvarur', 'Mannargudi', 'Thiruthuraipoondi', 'Nannilam'] },
  { name: 'Vellore', cities: ['Vellore', 'Katpadi', 'Gudiyatham', 'Pernambut'] },
  { name: 'Viluppuram', cities: ['Viluppuram', 'Tindivanam', 'Gingee', 'Marakkanam'] },
  { name: 'Virudhunagar', cities: ['Virudhunagar', 'Sivakasi', 'Rajapalayam', 'Aruppukottai', 'Sattur'] }
];

const seedIfEmpty = async () => {
  try {
    const districtCount = await District.countDocuments();
    if (districtCount === 0) {
      console.log('Districts database empty. Auto-seeding 38 districts...');
      await District.insertMany(districtsData);
      console.log('Auto-seeded districts successfully.');
    }

    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('Admin account empty. Auto-seeding default admin...');
      await User.create({
        name: 'TN TurfBook Admin',
        email: 'admin@turfbooktn.com',
        password: 'Admin@Password123',
        phone: '9876543210',
        role: 'admin',
        isApproved: true
      });
      console.log('Auto-seeded admin profile: admin@turfbooktn.com / Admin@Password123');
    }
  } catch (err) {
    console.error('Failed to auto-seed MongoDB data:', err.message);
  }
};

const connectDB = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    const isLocalDefault = !dbUri || dbUri === 'mongodb://127.0.0.1:27017/turfbook-tn';

    if (isLocalDefault) {
      console.log('Using default local MongoDB URI. Attempting to start MongoMemoryServer fallback...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        
        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
        await seedIfEmpty();
      } catch (err) {
        console.error('MongoMemoryServer initialization failed. Retrying default local connection...', err.message);
        const conn = await mongoose.connect('mongodb://127.0.0.1:27017/turfbook-tn');
        console.log(`MongoDB Connected (Local Default): ${conn.connection.host}`);
        await seedIfEmpty();
      }
    } else {
      const conn = await mongoose.connect(dbUri);
      console.log(`MongoDB Connected (Custom/Atlas): ${conn.connection.host}`);
      await seedIfEmpty();
    }
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
