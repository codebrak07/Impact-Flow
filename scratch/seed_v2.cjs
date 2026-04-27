const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, serverTimestamp } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDzwNKcYDrBtJFfE0TJv5Jx7CiNp26zHLc",
  authDomain: "troika-6e566.firebaseapp.com",
  projectId: "troika-6e566",
  storageBucket: "troika-6e566.firebasestorage.app",
  messagingSenderId: "916002120909",
  appId: "1:916002120909:web:3470b83b7571c5c44df584"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const seedData = async () => {
  const needs = [
    {
      title: "Emergency Water Supply",
      communityName: "Sector 7 Relief Camp",
      location: "East Valley",
      needCategory: "Water",
      urgency: "critical",
      description: "Urgent need for water purification tablets and distribution support for 200+ families.",
      status: "open",
      createdAt: new Date().toISOString()
    },
    {
      title: "Medical Record Management",
      communityName: "St. Mary's Clinic",
      location: "Downtown",
      needCategory: "Medical",
      urgency: "high",
      description: "Volunteer needed to help sort medical supplies and manage patient records during the surge.",
      status: "open",
      createdAt: new Date().toISOString()
    },
    {
      title: "Community Kitchen Support",
      communityName: "Greenwood Shelter",
      location: "North Hills",
      needCategory: "Food",
      urgency: "medium",
      description: "Evening meal preparation and distribution for 50+ residents. Help needed with logistics.",
      status: "open",
      createdAt: new Date().toISOString()
    },
    {
      title: "Logistics Coordinator",
      communityName: "City Logistics Hub",
      location: "Industrial Zone",
      needCategory: "Logistics",
      urgency: "high",
      description: "Overseeing the arrival and distribution of incoming aid shipments.",
      status: "open",
      createdAt: new Date().toISOString()
    }
  ];

  console.log("Starting seeding...");
  for (const need of needs) {
    try {
      await addDoc(collection(db, 'needs'), need);
      console.log(`Added need: ${need.title}`);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
};

seedData();
