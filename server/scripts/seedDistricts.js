require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const District = require('../models/District');
const connectDB = require('../config/db');

// List of all 38 Tamil Nadu districts and representative cities/towns
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

const seedDistricts = async () => {
  try {
    // Connect inside the script
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/turfbook-tn');
    console.log('Database connected for seeding districts...');

    // Clear existing
    await District.deleteMany();
    console.log('Cleared existing districts.');

    // Insert new
    await District.insertMany(districtsData);
    console.log(`Seeded ${districtsData.length} Tamil Nadu districts successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding districts failed:', error.message);
    process.exit(1);
  }
};

seedDistricts();
