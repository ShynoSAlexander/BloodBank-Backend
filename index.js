const express = require('express');
var cors= require('cors')
const bcrypt = require('bcrypt'); // For password hashing
const jwt = require('jsonwebtoken');
require('./connection');
const user = require('./model/user');
const Request = require('./model/Request');
const nodemailer = require('nodemailer');
// Initialization
const app = express();

// Middleware
app.use(express.json());
app.use(cors())

const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin'; 
////////////////////////////
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'shynosalexander2002@gmail.com',
    pass: 'bqdb rpuy woju lrbx'
  }
});

// Example email sending function
const sendEmail = async (to, subject, text) => {
  try {
    const info = await transporter.sendMail({
      from: 'shynosalexander2002@gmail.com',
      to,
      subject,
      text
    });
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Usage example
//sendEmail('shynosalexander02@gmail.com', 'Test Email', 'This is a test email from Node.js');
// To add data to the database
app.post('/add', async(req, res) => {
    try {
        console.log(req.body);
        await user(req.body).save();
        res.send({ message: 'User added successfully' });
    } catch (error) {
        console.log(error)
       
    }
})
//This one handles login
app.post('/login', async (req, res) => {
    try {
        const { Email, Password } = req.body;
        const existingUser = await user.findOne({ Email });
        if (Email === ADMIN_EMAIL && Password === ADMIN_PASSWORD) {
            const token = jwt.sign({ email: Email, role: 'admin' }, 'secret_key', { expiresIn: '1h' });
            return res.send({ message: 'Admin login successful', token, role: 'admin' });
        }

        if (!existingUser) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        if (Password !== existingUser.Password) {
            return res.status(400).send({ error: 'Invalid email or password' });
        }

        const token = jwt.sign({ userId: existingUser._id }, 'secret_key', { expiresIn: '1h' });
        res.send({ message: 'Login successful', token, role: 'user', name: `${existingUser.Firstname} ` });
        
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'An error occurred while logging in', Email, Password });
    }
});
app.post('/requests/add', async (req, res) => {
    try {
      const {
        name,
        age,
        email,
        phoneNumber,
        bloodType,
        requestCategory,
        numberOfUnits,
        predefinedAilments
      } = req.body;
  
      const newRequest = new Request({
        name,
        age,
        email,
        phoneNumber,
        bloodType,
        requestCategory,
        numberOfUnits,
        predefinedAilments
      });
  
      await newRequest.save();
      res.status(201).json({ message: 'Request added successfully', newRequest });
    } catch (error) {
      console.error('Error adding request:', error);
      res.status(500).json({ error: 'Failed to add request' });
    }
  });
  app.post('/requests/admin-add', async (req, res) => {
    const newRequest = new Request({ ...req.body, approved: true });
    try {
      const savedRequest = await newRequest.save();
      res.status(201).json(savedRequest);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
  app.get('/donors', async (req, res) => {
    try {
      const donors = await Request.find({ requestCategory: 'Donor', approved: true  });
      res.json(donors);
    } catch (error) {
      console.error('Error fetching donors:', error);
      res.status(500).json({ error: 'Error fetching donors' });
    }
  });
// to view all the users
////////////////////////////////////////////////////////////////////////////
app.delete('/admin/donors/delete/:id',async (req, res) => {
    try {
      const deletedDonor = await Request.findByIdAndDelete(req.params.id);
      if (!deletedDonor) {
        return res.status(404).json({ error: 'Donor not found' });
      }
      res.json({ message: 'Donor deleted successfully' });
    } catch (error) {
      console.error('Error deleting donor:', error);
      res.status(500).json({ error: 'Error deleting donor' });
    }
  });
  app.put('/admin/donors/update/:id', async (req, res) => {
    try {
        const updatedDonor = await Request.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedDonor) return res.status(404).json({ error: 'Donor not found' });
        res.json({ message: 'Donor updated successfully', updatedDonor });
    } catch (error) {
        console.error('Error updating donor:', error);
        res.status(500).json({ error: 'Error updating donor' });
    }
});
////////////////////////////////
app.get('/receivers', async (req, res) => {
  try {
    const requests = await Request.find();
    res.status(200).json(requests);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/admin/requests/approve/:id', async (req, res) => {
  try {
      const request = await Request.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
      if (!request) {
          return res.status(404).json({ error: 'Request not found' });
      }
      sendEmail(
        request.email,
        'Blood Donation Request Approved',
        `Dear ${request.name},\n\nYour blood donation request has been approved. Thank you for your contribution!\n\nBest regards,\nBlood Bank Team`
    );
      res.json({ message: 'Request approved successfully', request });
  } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({ error: 'Error approving request' });
  }
});

app.get('/view',async(req,res)=>{
    try{
        const data=await user.find()
        res.send(data)
    }catch(error){
        console.log(error)
    }
})
//to delete any user
app.delete('/admin/requests/reject/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Send rejection email
    sendEmail(
      request.email,
      'Blood Donation Request Rejected',
      `Dear ${request.name},\n\nWe regret to inform you that your blood donation request has been rejected.\n\nThank you for your understanding.\n\nBest regards,\nBlood Bank Team`
    );

    // Delete the request from the database after email is sent
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request rejected and deleted successfully' });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Error rejecting request' });
  }
});


///////////////////////////////////////////////////////////
app.delete('/remove/:id',async(req,res)=>{
  try{
      var data=await user.findByIdAndDelete(req.params.id)
      res.send({message:"deleted"})
  }catch(error){
      console.log(error)
  }
})
app.put('/edit/:id',async(req,res)=>{
    try{

        var data=await user.findByIdAndUpdate(req.params.id,req.body)
        res.send({message:"Updated successfully",data})
    }catch(error){
        console.log(error)
    }
})
app.listen(3001, () => {
    console.log('Port is up and running on 3001');
});
