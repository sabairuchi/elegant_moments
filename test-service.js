import { serviceService } from './server/services/serviceService.js';

async function test() {
  console.log("Creating service...");
  const newService = await serviceService.createService({
    name: "Test Service",
    category: "Other",
    startingPrice: 100,
    status: "ACTIVE"
  });
  console.log("Created:", newService.id);
  
  console.log("Fetching service...");
  try {
    const fetched = await serviceService.getServiceById(newService.id);
    console.log("Fetched successfully:", fetched.id);
  } catch (err) {
    console.error("Failed to fetch:", err.message);
  }
}

test();
