const { execSync } = require('child_process');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (email && password) {
  console.log(`Attempting to create admin user: ${email}...`);
  try {
    // Run the medusa user command
    execSync(`npx medusa user -e ${email} -p ${password}`, { stdio: 'inherit' });
    console.log('Admin user creation command finished.');
  } catch (error) {
    console.log('Admin user creation failed or user already exists. Skipping...');
  }
} else {
  console.log('ADMIN_EMAIL or ADMIN_PASSWORD environment variables not set. Skipping admin user creation.');
}
