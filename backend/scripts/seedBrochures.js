import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dns from 'dns';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import { createHyundaiSamplePdf } from '../utils/generateSamplePdf.js';
import { processDocument } from '../services/documentProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (error) {
  console.error('DNS configuration warning:', error.message);
}

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SAMPLE_BROCHURES = [
  {
    model: 'Hyundai Alcazar',
    filename: 'Hyundai_Alcazar_Brochure.pdf',
    title: 'Hyundai ALCAZAR — Official Specification & Feature Guide',
    pages: [
      `HYUNDAI ALCAZAR ENGINE & PERFORMANCE SPECIFICATIONS
Powertrain Options:
1.5 l Turbo GDi Petrol:
- Engine Displacement: 1 482 cc (4-cylinder, 16 Valves)
- Maximum Power: 117.5 kW (160 PS) @ 5 500 r/min
- Peak Torque: 253 Nm @ 1 500 - 3 500 r/min
- Transmissions: 6-Speed Manual & 7-Speed Dual Clutch Transmission (DCT)
1.5 l U2 CRDi Diesel:
- Engine Displacement: 1 493 cc (4-cylinder, 16 Valves)
- Maximum Power: 85 kW (116 PS) @ 4 000 r/min
- Peak Torque: 250 Nm @ 1 500 - 2 750 r/min
- Transmissions: 6-Speed Manual & 6-Speed Automatic
Fuel Tank Capacity: 50 Litres
Suspension: Front MacPherson Strut with Coil Spring, Rear Coupled Torsion Beam Axle.`,
      `HYUNDAI ALCAZAR SAFETY SYSTEMS & INTERIOR COMFORT
Standard Safety across all variants:
- 6 Airbags (Front, Side & Curtain airbags)
- All 4 Wheel Disc Brakes
- Electronic Stability Control (ESC) and Vehicle Stability Management (VSM)
- Hill Start Assist Control (HAC) and Tyre Pressure Monitoring System (Highline TPMS)
- Front & Rear Parking Sensors with Surround View Monitor (SVM)
Interior & Comfort Amenities:
- Seating: Versatile 6-Seater (with 2nd row captain seats and center console) & 7-Seater configurations
- Voice-enabled Smart Panoramic Sunroof
- Dual 10.25 inch Multi-Display Cluster with Navigation and HD Infotainment
- Bose Premium 8-Speaker Sound System
- Front Row Ventilated Seats with 8-way power adjustable driver seat.`,
      `HYUNDAI ALCAZAR VARIANT COMPARISON
Variant Distribution:
1. Prestige Variant (Entry):
- Includes 6 Airbags, all 4 disc brakes, LED headlights, 7-seater layout, panoramic sunroof, cruise control.
2. Platinum Variant (Mid-Level):
- Adds 10.25 inch Digital Cluster, Bose 8-Speaker sound system, wireless phone charger in 1st & 2nd row, 18-inch diamond cut alloy wheels.
3. Signature Variant (Top-Tier Flagship):
- Adds Hyundai SmartSense Level 2 ADAS (Forward Collision Avoidance, Lane Keeping Assist, Smart Cruise Control), ventilated front seats, dual-camera dashcam, and 360-degree camera.`
    ]
  },
  {
    model: 'Hyundai Creta',
    filename: 'Hyundai_Creta_Brochure.pdf',
    title: 'Hyundai CRETA — The Ultimate SUV Specification Guide',
    pages: [
      `HYUNDAI CRETA POWERTRAINS & DIMENSIONS
Vehicle Architecture:
Hyundai Creta is an iconic 5-seater compact SUV engineered for dynamic driving.
Dimensions:
- Overall Length: 4 330 mm
- Overall Width: 1 790 mm
- Overall Height: 1 635 mm
- Wheelbase: 2 610 mm
- Boot Space Capacity: 433 Litres
- Fuel Tank: 50 Litres
Engine Lineup:
1. 1.5 l MPi Petrol: 115 PS @ 6 300 r/min, 143.8 Nm torque @ 4 500 r/min (6-MT / IVT)
2. 1.5 l U2 CRDi Diesel: 116 PS @ 4 000 r/min, 250 Nm torque @ 1 500 - 2 750 r/min (6-MT / 6-AT)
3. 1.5 l Turbo GDi Petrol: 160 PS @ 5 500 r/min, 253 Nm torque @ 1 500 - 3 500 r/min (7-DCT).`,
      `HYUNDAI CRETA SAFETY, CABIN & TECHNOLOGY
Safety Equipment:
- 6 Airbags Standard across all trims
- All 4 Disc Brakes, ESC, VSM, HAC
- Emergency Stop Signal (ESS), ISOFIX Child Anchorages
- Blind-spot View Monitor & 360 Degree Camera
Cabin Experience:
- Dual Zone Automatic Temperature Control
- 10.25 inch Connected Touchscreen Infotainment with Android Auto & Apple CarPlay
- Voice-controlled Panoramic Sunroof, Leatherette Seat Upholstery
- 2-row dedicated seating layout comfortably accommodating 5 adults.`
    ]
  },
  {
    model: 'Hyundai i20',
    filename: 'Hyundai_i20_Brochure.pdf',
    title: 'Hyundai i20 — Premium Urban Hatchback Brochure',
    pages: [
      `HYUNDAI i20 DESIGN, POWERTRAIN & CITY AGILITY
Overview:
Hyundai i20 is a premium sporty hatchback built on a wide track platform with aerodynamic stance.
Engine Specifications:
- 1.2 l Kappa Petrol Engine: 1 197 cc displacement
- Max Power: 83 PS @ 6 000 r/min (5-Speed Manual) / 88 PS @ 6 000 r/min (IVT Automatic)
- Peak Torque: 114.7 Nm @ 4 200 r/min
- Fuel Tank: 37 Litres
- Boot Space: 311 Litres
Driving Dynamics:
- Compact turning radius of 5.1 meters ideal for narrow city lanes and effortless urban parking
- MacPherson strut front and coupled torsion beam rear suspension.`,
      `HYUNDAI i20 SAFETY & CONNECTIVITY
Safety Standards:
- 6 Airbags standard across all variants
- Electronic Stability Control (ESC), Hill-Assist Control (HAC)
- Rear parking camera with dynamic guidelines, Tyre Pressure Monitoring
Technology & Cockpit:
- 10.25 inch touchscreen infotainment with BlueLink connected car tech
- Bose Premium 7-Speaker sound system
- Ambient lighting in 64 colors
- Wireless smartphone charging pad.`
    ]
  },
  {
    model: 'Hyundai Aura',
    filename: 'Hyundai_Aura_Brochure.pdf',
    title: 'Hyundai AURA — Compact Family Sedan Brochure',
    pages: [
      `HYUNDAI AURA PRACTICALITY, ENGINE & LUGGAGE CAPACITY
Overview:
Hyundai Aura is a stylish and spacious compact sedan designed with a 3-box profile for families.
Boot Space & Passenger Space:
- Massive 402 Litres dedicated sedan trunk capacity (capable of holding multiple large suitcases)
- Generous rear seat legroom and knee room with rear center armrest with cupholders
- Rear AC Vents for passenger comfort
Engine Options:
1. 1.2 l Kappa Dual VTVT Petrol: 83 PS @ 6 000 r/min, 113.8 Nm torque @ 4 000 r/min (5-MT / Smart Auto AMT)
2. 1.2 l Bi-Fuel (Petrol + CNG): 69 PS (Petrol) / 95.2 Nm torque on CNG mode, delivering exceptional operating economy.`,
      `HYUNDAI AURA SAFETY & CONVENIENCE
Safety & Security:
- 6 Airbags standard across all variants (first in segment)
- Electronic Stability Control (ESC) and Hill-Start Assist Control (HAC)
- Highline Tyre Pressure Monitoring System (TPMS)
- ISOFIX child seat tethers, Central Locking, Burglar Alarm
Convenience & Economy:
- Cruise Control for relaxed highway journeys
- 8-inch touchscreen infotainment with smartphone integration
- Fast USB-C phone charging ports in front and rear
- Outstanding fuel efficiency for daily city commutes and extended family road trips.`
    ]
  }
];

async function seed() {
  console.log('==================================================');
  console.log('  Hyundai AI Automotive Assistant — Database Seeder');
  console.log('==================================================');

  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hyundai_ai_db';
    await mongoose.connect(mongoUri);
    console.log(`[Seeder] Connected to MongoDB at: ${mongoUri}`);

    // 1. Create or Find Demo Users (guaranteeing both demo@hyundai-ai.com and demo@hyundai.com)
    const demoEmails = ['demo@hyundai-ai.com', 'demo@hyundai.com'];
    let primaryDemoUser = null;

    for (const email of demoEmails) {
      let user = await User.findOne({ email }).select('+password');
      if (!user) {
        user = await User.create({
          name: 'Hyundai Automotive Specialist',
          email,
          password: 'Hyundai2026!'
        });
        console.log(`[Seeder] Created demo user: ${email} (Password: Hyundai2026!)`);
      } else {
        // Re-sync password to guarantee it matches Hyundai2026!
        user.password = 'Hyundai2026!';
        await user.save();
        console.log(`[Seeder] Password re-verified & updated for demo user: ${email}`);
      }
      if (!primaryDemoUser) primaryDemoUser = user;
    }
    const demoUser = primaryDemoUser;

    // 2. Prepare sample directories
    const sampleDir = path.join(__dirname, '../sample_brochures');
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(sampleDir)) fs.mkdirSync(sampleDir, { recursive: true });
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    // 3. Generate and Ingest each brochure
    for (const item of SAMPLE_BROCHURES) {
      console.log(`\n[Seeder] Processing "${item.model}"...`);
      const samplePdfPath = path.join(sampleDir, item.filename);
      const uploadPdfPath = path.join(uploadsDir, item.filename);

      // Generate PDF
      await createHyundaiSamplePdf(samplePdfPath, item.title, item.model, item.pages);
      // Copy to uploads
      fs.copyFileSync(samplePdfPath, uploadPdfPath);
      console.log(`  ✓ Generated PDF brochure: ${item.filename}`);

      // Check if document already exists; update or create
      let doc = await Document.findOne({ originalName: item.filename });
      if (doc) {
        doc.vehicleModel = item.model;
        doc.storagePath = uploadPdfPath;
        doc.fileUrl = `/uploads/${item.filename}`;
        doc.processingStatus = 'Uploaded';
        await doc.save();
      } else {
        doc = await Document.create({
          fileName: item.filename,
          originalName: item.filename,
          vehicleModel: item.model,
          fileUrl: `/uploads/${item.filename}`,
          storagePath: uploadPdfPath,
          fileSize: fs.statSync(uploadPdfPath).size,
          uploadedBy: demoUser._id,
          processingStatus: 'Uploaded'
        });
      }

      // Process, chunk, embed, and index
      await processDocument(doc._id);
      const updatedDoc = await Document.findById(doc._id);
      console.log(`  ✓ Document indexed: ${updatedDoc.chunkCount} knowledge chunks across ${updatedDoc.pageCount} pages. Status: ${updatedDoc.processingStatus}`);
    }

    const totalDocs = await Document.countDocuments();
    const totalChunks = await DocumentChunk.countDocuments();

    console.log('\n==================================================');
    console.log(`[Seeder SUCCESS] Seeding completed successfully!`);
    console.log(`Total Brochures in Database: ${totalDocs}`);
    console.log(`Total Indexed Vector Chunks: ${totalChunks}`);
    console.log('Login credentials: demo@hyundai-ai.com / Hyundai2026!');
    console.log('==================================================');
  } catch (err) {
    console.error('[Seeder ERROR]:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

seed();
