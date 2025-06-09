// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory data storage (simulating a database)
let resources = [
    {
        id: 1,
        name: "Delhi Emergency Shelter Complex",
        lat: 28.6139,
        lng: 77.2090,
        type: "shelter",
        contact: "+91-11-1234567890",
        capacity: 500,
        description: "Large emergency shelter with dormitories, medical facility, and kitchen",
        address: "Connaught Place, New Delhi",
        operatingHours: "24/7",
        facilities: ["Medical Aid", "Food", "Shelter", "Communication"],
        status: "active",
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    },
    {
        id: 2,
        name: "Mumbai Flood Relief Center",
        lat: 19.0760,
        lng: 72.8777,
        type: "food",
        contact: "+91-22-9988776655",
        capacity: 800,
        description: "24/7 food distribution center with fresh meals and emergency supplies",
        address: "Bandra West, Mumbai",
        operatingHours: "24/7",
        facilities: ["Food Distribution", "Water", "Emergency Supplies"],
        status: "active",
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    },
    {
        id: 3,
        name: "Chennai Medical Emergency Hub",
        lat: 13.0827,
        lng: 80.2707,
        type: "medical",
        contact: "+91-44-9876543210",
        capacity: 300,
        description: "Fully equipped medical center with trauma care and ambulance services",
        address: "T. Nagar, Chennai",
        operatingHours: "24/7",
        facilities: ["Emergency Care", "Trauma Unit", "Ambulance", "Pharmacy"],
        status: "active",
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    },
    {
        id: 4,
        name: "Bangalore Disaster Response Center",
        lat: 12.9716,
        lng: 77.5946,
        type: "shelter",
        contact: "+91-80-1111222233",
        capacity: 400,
        description: "Multi-purpose disaster response facility with coordination center",
        address: "Whitefield, Bangalore",
        operatingHours: "24/7",
        facilities: ["Shelter", "Coordination", "Communication", "Transportation"],
        status: "active",
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    },
    {
        id: 5,
        name: "Kolkata Community Kitchen",
        lat: 22.5726,
        lng: 88.3639,
        type: "food",
        contact: "+91-33-4444555566",
        capacity: 1000,
        description: "Large community kitchen serving traditional meals and special dietary needs",
        address: "Park Street, Kolkata",
        operatingHours: "6:00 AM - 10:00 PM",
        facilities: ["Hot Meals", "Special Diet", "Takeaway", "Delivery"],
        status: "active",
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    }
];

let emergencyAlerts = [
    {
        id: 1,
        title: "Cyclone Warning - Eastern Coast",
        description: "Severe cyclone expected to hit eastern coastal regions. All resources on high alert.",
        severity: "high",
        affectedAreas: ["Chennai", "Kolkata", "Bhubaneswar"],
        dateCreated: new Date().toISOString(),
        isActive: true
    },
    {
        id: 2,
        title: "Flood Alert - Mumbai Region",
        description: "Heavy rainfall expected. Flood relief centers activated.",
        severity: "medium",
        affectedAreas: ["Mumbai", "Pune", "Nashik"],
        dateCreated: new Date().toISOString(),
        isActive: true
    }
];

let reports = [];
let volunteerRequests = [];

// API Routes

// Get all resources
app.get('/api/resources', (req, res) => {
    const { type, search, limit = 50 } = req.query;
    let filteredResources = [...resources];

    if (type) {
        filteredResources = filteredResources.filter(resource => resource.type === type);
    }

    if (search) {
        const searchLower = search.toLowerCase();
        filteredResources = filteredResources.filter(resource =>
            resource.name.toLowerCase().includes(searchLower) ||
            resource.description.toLowerCase().includes(searchLower) ||
            resource.address.toLowerCase().includes(searchLower)
        );
    }

    res.json({
        success: true,
        data: filteredResources.slice(0, parseInt(limit)),
        total: filteredResources.length
    });
});

// Get single resource
app.get('/api/resources/:id', (req, res) => {
    const resource = resources.find(r => r.id === parseInt(req.params.id));
    if (!resource) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found'
        });
    }
    res.json({
        success: true,
        data: resource
    });
});

// Add new resource
app.post('/api/resources', (req, res) => {
    const {
        name, lat, lng, type, contact, capacity,
        description, address, operatingHours, facilities
    } = req.body;

    // Validation
    if (!name || !lat || !lng || !type || !contact || !capacity) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
            success: false,
            message: 'Invalid coordinates'
        });
    }

    const newResource = {
        id: Date.now(),
        name,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        type,
        contact,
        capacity: parseInt(capacity),
        description: description || '',
        address: address || '',
        operatingHours: operatingHours || '24/7',
        facilities: facilities || [],
        status: 'active',
        dateAdded: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
    };

    resources.push(newResource);

    res.status(201).json({
        success: true,
        data: newResource,
        message: 'Resource added successfully'
    });
});

// Update resource
app.put('/api/resources/:id', (req, res) => {
    const resourceIndex = resources.findIndex(r => r.id === parseInt(req.params.id));
    if (resourceIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found'
        });
    }

    const updatedResource = {
        ...resources[resourceIndex],
        ...req.body,
        lastUpdated: new Date().toISOString()
    };

    resources[resourceIndex] = updatedResource;

    res.json({
        success: true,
        data: updatedResource,
        message: 'Resource updated successfully'
    });
});

// Delete resource
app.delete('/api/resources/:id', (req, res) => {
    const resourceIndex = resources.findIndex(r => r.id === parseInt(req.params.id));
    if (resourceIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found'
        });
    }

    resources.splice(resourceIndex, 1);

    res.json({
        success: true,
        message: 'Resource deleted successfully'
    });
});

// Get statistics
app.get('/api/stats', (req, res) => {
    const stats = resources.reduce((acc, resource) => {
        acc[resource.type] = (acc[resource.type] || 0) + 1;
        acc.totalCapacity += resource.capacity;
        acc.totalResources++;
        return acc;
    }, {
        shelter: 0,
        food: 0,
        medical: 0,
        totalCapacity: 0,
        totalResources: 0
    });

    res.json({
        success: true,
        data: stats
    });
});

// Emergency Alerts
app.get('/api/alerts', (req, res) => {
    res.json({
        success: true,
        data: emergencyAlerts.filter(alert => alert.isActive)
    });
});

app.post('/api/alerts', (req, res) => {
    const { title, description, severity, affectedAreas } = req.body;

    const newAlert = {
        id: Date.now(),
        title,
        description,
        severity,
        affectedAreas: affectedAreas || [],
        dateCreated: new Date().toISOString(),
        isActive: true
    };

    emergencyAlerts.push(newAlert);

    res.status(201).json({
        success: true,
        data: newAlert,
        message: 'Alert created successfully'
    });
});

// Reports
app.post('/api/reports', (req, res) => {
    const { resourceId, issue, description, reporterContact } = req.body;

    const newReport = {
        id: Date.now(),
        resourceId,
        issue,
        description,
        reporterContact,
        status: 'pending',
        dateReported: new Date().toISOString()
    };

    reports.push(newReport);

    res.status(201).json({
        success: true,
        data: newReport,
        message: 'Report submitted successfully'
    });
});

// Volunteer requests
app.post('/api/volunteer', (req, res) => {
    const { name, email, phone, skills, availability, location } = req.body;

    const newVolunteer = {
        id: Date.now(),
        name,
        email,
        phone,
        skills: skills || [],
        availability,
        location,
        status: 'pending',
        dateRegistered: new Date().toISOString()
    };

    volunteerRequests.push(newVolunteer);

    res.status(201).json({
        success: true,
        data: newVolunteer,
        message: 'Volunteer application submitted successfully'
    });
});

// Search nearby resources
app.get('/api/resources/nearby/:lat/:lng', (req, res) => {
    const { lat, lng } = req.params;
    const { radius = 50, type } = req.query; // radius in km

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // Simple distance calculation (Haversine formula)
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    let nearbyResources = resources.map(resource => ({
        ...resource,
        distance: calculateDistance(userLat, userLng, resource.lat, resource.lng)
    })).filter(resource => resource.distance <= parseFloat(radius));

    if (type) {
        nearbyResources = nearbyResources.filter(resource => resource.type === type);
    }

    nearbyResources.sort((a, b) => a.distance - b.distance);

    res.json({
        success: true,
        data: nearbyResources,
        total: nearbyResources.length
    });
});

// Serve static files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Disaster Resource Finder Server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

module.exports = app;