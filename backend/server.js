const { fork } = require('child_process');

// Function to start the servers
function startServers() {
  // Start server1.js
  const server1 = fork('server1.js');
  server1.on('error', (err) => {
    console.error('Error starting server1:', err);
  });

  // Start server2.js
  const server2 = fork('server2.js');
  server2.on('error', (err) => {
    console.error('Error starting server2:', err);
  });

  // Log when both servers are started
  server1.on('message', (msg) => {
    console.log(`Server1: ${msg}`);
  });

  server2.on('message', (msg) => {
    console.log(`Server2: ${msg}`);
  });

  // Stop servers after 60 seconds
  setTimeout(() => {
    console.log('Stopping servers...');
    server1.kill();
    server2.kill();

    // Wait for 10 seconds before restarting
    setTimeout(() => {
      console.log('Restarting servers...');
      startServers();
    }, 10000); // 10 seconds

  }, 60000); // 60 seconds
}

// Start the servers for the first time
startServers();

// Handle process exit
process.on('exit', () => {
  console.log('Exiting main process...');
});

// Optionally, you can listen for SIGINT to gracefully exit
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  process.exit();
});
