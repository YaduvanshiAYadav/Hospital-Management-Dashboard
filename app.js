const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Patient = require('./PatientDashboard/Patient');
const path = require('path');

const Finance = require('./FinanceDashboard/Finance');
const session = require('express-session');
app.use(session({ secret: 'yourSecretKey', resave: false, saveUninitialized: true }));


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  
  res.render('./home.ejs');
});
app.get('/addPatient', (req, res) => {
  
  res.render('./addPatient.ejs');
});
app.get('/addtaffs', (req, res) => {
  
  res.render('./addStaff.ejs');
});
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

//const MONGO_URL = 'mongodb://localhost:27017/hospitalDB'; // 👈 your DB name
// Connect to MongoDB
// mongoose.connect(MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => {
//   console.log('✅ Connected to MongoDB hospitalDB');
// })
// .catch((err) => {
//   console.error('❌ MongoDB connection failed:', err);
// });
// Start the server
// app.listen(504, () => {
//   console.log('Server is live at http://localhost:504');
// });
app.get('/dashboard/patients/new', (req, res) => {
  console.log(add-patient);
  //res.render('add-patient');
});
//Add POST Route in server.js to Save to DB

app.post('/dashboard/patients', async (req, res) => {
  try {
    const {
      name,
      username,
      password,
      age,
      gender,
      contact,
      address,
      medicalHistory
    } = req.body;

    // Basic validation
    if (!name) return res.status(400).send("⚠️ Name is required");

    // Parse medical history from CSV string to array
    const historyArray = medicalHistory
      ? medicalHistory.split(',').map(item => item.trim())
      : [];

    // Create new patient instance
    const newPatient = new Patient({
      name,
      username,
      password,
      age,
      gender,
      contact,
      address,
      medicalHistory: historyArray
    });

    await newPatient.save();
    console.log("✅ New patient saved:", newPatient);

    res.redirect('/dashboard/patients'); // or wherever you want to redirect
  } catch (error) {
    console.error("❌ Error saving patient:", error);
    res.status(500).send("Internal Server Error");
  }
});
//for staffs 
const Staff = require('./StaffDashboard/staff.js'); // adjust path if needed

app.post('/dashboard/staff', async (req, res) => {
  try {
    const { name, username, password, role, contact, department, address } = req.body;

    if (!name || !username || !password) {
      return res.status(400).send('⚠️ Name, username, and password are required');
    }

    const newStaff = new Staff({
      name,
      username,
      password,
      role,
      contact,
      department,
      address
    });

    await newStaff.save();

    console.log('✅ New staff saved:', newStaff.name);

    res.redirect('/dashboard/staff-login.ejs'); // adjust based on your routing
  } catch (err) {
    console.error('❌ Error saving staff:', err);
    res.status(500).send('❌ Internal Server Error');
  }
});


app.get('/dashboard/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.render('patientDashboard.ejs', { patients });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading patient dashboard');
  }
});
app.get('/dashboard/patients/add', (req, res) => {
  res.render('addPatient.ejs'); // or your EJS file name
});

app.get('/dashboard/staff/register', (req, res) => {
  res.render('addStaff.ejs'); // create this EJS if not done yet
});
app.get('/dashboard/patients/login', (req, res) => {
  res.render('patient-login.ejs');
});

app.get('/dashboard/staff/login', (req, res) => {
  res.render('staff-login.ejs');
});
app.get('/dashboard/patients/add', (req, res) => {
  res.render('.views/addPatient.ejs'); // Make sure your EJS file is named addPatient.ejs and located in the views folder
});
app.post('/dashboard/patients/register', async (req, res) => {
  try {
    const { name, username, password, age, gender, contact, address, medicalHistory } = req.body;

    const newPatient = new Patient({
      name,
      username,
      password,
      age,
      gender,
      contact,
      address,
      medicalHistory: medicalHistory ? medicalHistory.split(',').map(s => s.trim()) : []
    });

    await newPatient.save();
    res.redirect('/dashboard/patients/login'); // or wherever you want
  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).send('Error registering patient.');
  }
});app.post('/dashboard/staff/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find staff by username
    const staff = await Staff.findOne({ username });

    if (!staff) {
      return res.status(401).send('❌ No staff found with that username.');
    }

    // Check password (you can use bcrypt in future)
    if (staff.password !== password) {
      return res.status(401).send('❌ Incorrect password.');
    }

    // Login successful
    res.render('staff-dashboard.ejs',{staff});  // Or wherever you want to take them

  } catch (err) {
    console.error('Staff Login Error:', err);
    res.status(500).send('Server error during staff login.');
  }
});

app.post('/dashboard/patients/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const patient = await Patient.findOne({ username });

    if (!patient) {
      return res.status(401).send('❌ No patient found with that username.');
    }

    if (patient.password !== password) {
      return res.status(401).send('❌ Incorrect password.');
    }

    // If login is successful, show dashboard
    res.render('patientDashboard.ejs', { patient }); // optional: pass patient data

  } catch (err) {
    console.error('Patient Login Error:', err);
    res.status(500).send('Server error during patient login.');
  }
});
app.get('/dashboard/finance', (req, res) => {
  res.render('finance-dashboard');
});
app.post('/dashboard/patients/login', async (req, res) => {
  const { username, password } = req.body;
  const patient = await Patient.findOne({ username });

  if (patient && patient.password === password) {
    req.session.patientId = patient._id; // Store patient ID in session
    res.redirect('/dashboard/patients');
  } else {
    res.status(401).send('Invalid credentials');
  }
});
app.get('/dashboard/patients', async (req, res) => {
  try {
    const patientId = req.session.patientId;

    if (!patientId) return res.redirect('/dashboard/patients/login');

    const patient = await Patient.findById(patientId);

    if (!patient) return res.status(404).send('Patient not found');

    res.render('patient-dashboard', { patient });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading dashboard');
  }
});

// GET /dashboard/staff
// Show Appointments Form
app.get('/dashboard/appointments', (req, res) => {
  res.render('appointments', { successMsg: null });
});

// Show Admission/Discharge Form
app.get('/dashboard/admissions', (req, res) => {
  res.render('admissions', { successMsg: null });
});

// Show Discharge Form
app.get('/dashboard/discharge', (req, res) => {
  res.render('discharge', { successMsg: null });
});

// Show Communications Form
app.get('/dashboard/communications', (req, res) => {
  res.render('communications', { successMsg: null });
});

//message pops
app.get('/dashboard/staff', (req, res) => {
  if (!req.session.staff) {
    return res.redirect('/dashboard/staff/login.ejs');
  }

  const staff = req.session.staff;
  res.render('staff-dashboard.ejs', { staff });
});
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});
//das pat
app.post('/dashboard/appointments', async (req, res) => {
  try {
    const { patientName, dateTime, doctor } = req.body;
    // Save appointment to DB logic...

    res.render('appointments', { successMsg: '✅ Appointment successfully scheduled!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to schedule appointment.');
  }
});


app.post('/dashboard/admissions', async (req, res) => {
  try {
    const { patientName, room, status } = req.body;
    // Save to DB logic here...
    res.render('admissions', { successMsg: '✅ Admission/Discharge recorded successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to process admission/discharge');
  }
});

app.post('/dashboard/communications', async (req, res) => {
  try {
    const { recipient, message, channel } = req.body;
    // Logic to send message (e.g., store or call an API)...

    res.render('communications', { successMsg: '📨 Message sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to send message.');
  }
});

app.get('/dashboard/discharge', (req, res) => {
  res.render('discharge');
});

//staff pops
app.get('/dashboard/staff/roster', (req, res) => {
  res.render('staffRoster.ejs');
});

app.get('/dashboard/staff/attendance', (req, res) => {
  res.render('staffAttendance.ejs');
});

app.get('/dashboard/staff/department', (req, res) => {
  res.render('departmentOverview.ejs');
});

app.get('/dashboard/staff/notifications', (req, res) => {
  res.render('staffNotifications.ejs');
});

app.post('/dashboard/staff/roster', async (req, res) => {
  // you can save the data to DB here
  res.redirect('/dashboard/staff/roster?success=roster');
});

app.post('/dashboard/staff/attendance', async (req, res) => {
  res.redirect('/dashboard/staff/attendance?success=attendance');
});

app.post('/dashboard/staff/department', async (req, res) => {
  res.redirect('/dashboard/staff/department?success=department');
});

app.post('/dashboard/staff/notifications', async (req, res) => {
  res.redirect('/dashboard/staff/notifications?success=notification');
});

//finDashboard
app.post('/dashboard/finance/billing', async (req, res) => {
  // Optional: save to DB here
  console.log('Billing Info:', req.body); // Just for dev check
  res.redirect('/dashboard/finance/billing?success=billing');
});
// Billing Overview
app.get('/dashboard/finance/billing', (req, res) => {
  res.render('billing.ejs');
});

app.post('/dashboard/finance/billing', async (req, res) => {
  const { amount, description } = req.body;
  try {
    await Finance.create({ type: 'billing', amount, description });
    res.send("✅ Bill submitted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to submit bill');
  }
});

// Insurance Claims
app.get('/dashboard/finance/insurance', (req, res) => {
  res.render('insurance.ejs');
});

app.post('/dashboard/finance/insurance', async (req, res) => {
  const { amount, description, status } = req.body;
  try {
    await Finance.create({ type: 'insurance', amount, description, status });
    res.send("✅ Insurance claim submitted");
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to submit insurance claim');
  }
});

// Revenue Trends (Placeholder for future visualization)
app.get('/dashboard/finance/revenue', async (req, res) => {
  try {
    const revenues = await Finance.find({ type: 'billing' }).sort({ createdAt: 1 });
    res.render('revenue.ejs', { revenues });
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to load revenue trends');
  }
});


// Overdue Payments
app.get('/dashboard/finance/overdue', (req, res) => {
  res.render('overdue.ejs');
});

app.post('/dashboard/finance/overdue', async (req, res) => {
  const { amount, description, dueDate } = req.body;
  try {
    await Finance.create({ type: 'overdue', amount, description, dueDate });
    res.send("✅ Overdue payment tracked");
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to track overdue payment');
  }
});