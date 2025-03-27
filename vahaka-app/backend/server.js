const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Sample data
let drivers = [
  {
    id: '1',
    name: 'John Doe',
    rating: 4.8,
    trips: 120,
    price: 1200,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    badges: [
      { id: '1', name: 'Business', icon: 'briefcase' },
      { id: '2', name: 'Outstation', icon: 'car-sport' }
    ],
    description: 'Professional driver with 5+ years of experience. Specializes in business trips and outstation journeys. Excellent knowledge of highways and city routes.',
    languages: ['English', 'Hindi'],
    vehicle: {
      make: 'Toyota',
      model: 'Innova Crysta',
      year: '2022',
      color: 'Silver'
    },
    vehicleImage: 'https://imgd.aeplcdn.com/642x361/n/cw/ec/51435/innova-crysta-exterior-right-front-three-quarter-2.jpeg?q=75',
    reviews: [
      { id: '1', userId: 'user1', userName: 'Alex M.', userAvatar: 'https://randomuser.me/api/portraits/men/22.jpg', rating: 5, text: 'Very professional and punctual. Made our business trip hassle-free.', date: '2023-03-10' },
      { id: '2', userId: 'user2', userName: 'Sarah K.', userAvatar: 'https://randomuser.me/api/portraits/women/22.jpg', rating: 4, text: 'Good driving skills and knows the city well.', date: '2023-02-02' },
    ]
  },
  {
    id: '2',
    name: 'Sarah Smith',
    rating: 4.9,
    trips: 85,
    price: 1500,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    badges: [
      { id: '3', name: 'Weekly', icon: 'calendar' },
      { id: '1', name: 'Business', icon: 'briefcase' }
    ],
    description: 'Experienced driver specialized in weekly bookings. Known for safe driving and excellent customer service. Preferred by business executives.',
    languages: ['English', 'Hindi', 'Gujarati'],
    vehicle: {
      make: 'Honda',
      model: 'City ZX',
      year: '2023',
      color: 'White'
    },
    vehicleImage: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/134287/city-exterior-right-front-three-quarter-3.jpeg?isig=0&q=75',
    reviews: [
      { id: '1', userId: 'user3', userName: 'Rajat S.', userAvatar: 'https://randomuser.me/api/portraits/men/28.jpg', rating: 5, text: 'Outstanding service! Sarah made our week-long trip very comfortable.', date: '2023-03-21' },
      { id: '2', userId: 'user4', userName: 'Priya L.', userAvatar: 'https://randomuser.me/api/portraits/women/28.jpg', rating: 5, text: 'Very professional and friendly. Would definitely book again.', date: '2023-02-15' },
    ]
  },
  {
    id: '3',
    name: 'Mike Johnson',
    rating: 4.7,
    trips: 150,
    price: 1100,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    badges: [
      { id: '4', name: 'Urgent', icon: 'flash' },
      { id: '2', name: 'Outstation', icon: 'car-sport' }
    ],
    description: 'Quick response driver for urgent bookings. Experienced in outstation trips with excellent highway driving skills.',
    languages: ['English', 'Hindi', 'Marathi'],
    vehicle: {
      make: 'Maruti Suzuki',
      model: 'Dzire',
      year: '2021',
      color: 'Blue'
    },
    vehicleImage: 'https://imgd.aeplcdn.com/664x374/n/cw/ec/45691/dzire-exterior-right-front-three-quarter-3.jpeg?q=75',
    reviews: [
      { id: '1', userId: 'user5', userName: 'Vikram J.', userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 4, text: 'Reached within minutes for our urgent requirement. Good driving.', date: '2023-03-25' },
      { id: '2', userId: 'user6', userName: 'Meera P.', userAvatar: 'https://randomuser.me/api/portraits/women/32.jpg', rating: 5, text: 'Very helpful during our outstation trip. Knows all the good spots.', date: '2023-03-11' },
    ]
  }
];

let bookings = [];
let users = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    phone: '9876543210',
    bookings: [],
    paymentMethods: [
      { id: '1', type: 'card', last4: '4582', expiry: '09/25', isDefault: true },
      { id: '2', type: 'upi', upiId: 'example@upi', isDefault: false }
    ]
  }
];

// API Routes

// Get all drivers
app.get('/api/drivers', (req, res) => {
  // Filter by tripType if query param exists
  const { tripType } = req.query;
  
  if (tripType) {
    const filteredDrivers = drivers.filter(driver => 
      driver.badges.some(badge => badge.name.toLowerCase() === tripType.toLowerCase())
    );
    return res.json(filteredDrivers);
  }
  
  res.json(drivers);
});

// Get a specific driver by ID
app.get('/api/drivers/:id', (req, res) => {
  const driver = drivers.find(d => d.id === req.params.id);
  
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  
  res.json(driver);
});

// Create a new booking
app.post('/api/bookings', (req, res) => {
  const { userId, driverId, startDate, duration, totalAmount, location, destination } = req.body;
  
  if (!userId || !driverId || !startDate || !duration || !totalAmount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const user = users.find(u => u.id === userId);
  const driver = drivers.find(d => d.id === driverId);
  
  if (!user || !driver) {
    return res.status(404).json({ error: 'User or driver not found' });
  }

  // Calculate end date
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + parseInt(duration));
  
  const booking = {
    id: (bookings.length + 1).toString(),
    userId,
    driverId,
    driverName: driver.name,
    driverImage: driver.image,
    startDate,
    endDate: endDate.toISOString().split('T')[0],
    duration: duration.toString(),
    totalAmount,
    location: location || 'Not specified',
    destination: destination || 'Not specified',
    status: 'confirmed',
    paymentMethod: user.paymentMethods.find(pm => pm.isDefault) ? 
      `${user.paymentMethods.find(pm => pm.isDefault).type.toUpperCase()} **** ${user.paymentMethods.find(pm => pm.isDefault).last4 || ''}` : 
      'Not specified',
    createdAt: new Date().toISOString(),
    tripType: driver.badges[0].name
  };
  
  bookings.push(booking);
  user.bookings.push(booking.id);
  
  res.status(201).json(booking);
});

// Get all bookings for a user
app.get('/api/users/:userId/bookings', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const userBookings = bookings.filter(booking => booking.userId === user.id);
  res.json(userBookings);
});

// Get user profile
app.get('/api/users/:userId', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Don't send sensitive information
  const { id, name, email, paymentMethods } = user;
  const userBookings = bookings.filter(booking => booking.userId === user.id);
  
  res.json({
    id,
    name,
    email,
    bookingsCount: userBookings.length,
    paymentMethods,
    stats: {
      bookings: userBookings.length,
      drivers: [...new Set(userBookings.map(b => b.driverId))].length,
      rating: 4.9 // Mock rating
    }
  });
});

// Add a payment method
app.post('/api/users/:userId/payment-methods', (req, res) => {
  const { type, details } = req.body;
  const user = users.find(u => u.id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!type || !details) {
    return res.status(400).json({ error: 'Missing payment method details' });
  }
  
  const newPaymentMethod = {
    id: (user.paymentMethods.length + 1).toString(),
    type,
    ...details,
    isDefault: false
  };
  
  user.paymentMethods.push(newPaymentMethod);
  
  res.status(201).json(newPaymentMethod);
});

// Set default payment method
app.put('/api/users/:userId/payment-methods/:paymentId/default', (req, res) => {
  const user = users.find(u => u.id === req.params.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const paymentMethod = user.paymentMethods.find(pm => pm.id === req.params.paymentId);
  
  if (!paymentMethod) {
    return res.status(404).json({ error: 'Payment method not found' });
  }
  
  // Set all payment methods to non-default
  user.paymentMethods.forEach(pm => {
    pm.isDefault = false;
  });
  
  // Set the requested payment method as default
  paymentMethod.isDefault = true;
  
  res.json(paymentMethod);
});

// Add review for a driver
app.post('/api/drivers/:driverId/reviews', (req, res) => {
  const { userId, rating, text } = req.body;
  const driver = drivers.find(d => d.id === req.params.driverId);
  
  if (!driver) {
    return res.status(404).json({ error: 'Driver not found' });
  }
  
  if (!userId || !rating || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const review = {
    id: (driver.reviews.length + 1).toString(),
    userId,
    userName: user.name,
    userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg', // Mock avatar
    rating: parseInt(rating),
    text,
    date: new Date().toISOString().split('T')[0]
  };
  
  driver.reviews.push(review);
  
  // Update driver rating
  const totalRating = driver.reviews.reduce((sum, r) => sum + r.rating, 0);
  driver.rating = parseFloat((totalRating / driver.reviews.length).toFixed(1));
  
  res.status(201).json(review);
});

// 404 handler - for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? {} : {
      stack: err.stack,
      details: err.details || null
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app; 