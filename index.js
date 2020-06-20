const process = require('process');
const { Driver } = require('zwave-js');
const timeout = 3800;
var size, ownId, interval;

// Tell the driver which serial port to use
const driver = new Driver('/dev/tty.usbmodem1411101', {
  'timeouts': {
    /** how long to wait for an ACK */
    'ack': timeout,
    /** not sure */
    'byte': timeout,
    /** How much time a node gets to process a request */
    'report': timeout
  }
});

// Should process exit terminate driver
process.on('SIGINT', () => {
  driver.destroy();
  process.exit();
});

// the method to try adding a node every second
const triggerAddNode = () => {
  interval = setInterval(addNode, 1000);
}

// declare the method to add a node
const addNode = () => {
  try {
    driver.controller.beginInclusion(success => {
      if (success) {
        console.log('Added a node successfully');
      } else {
        console.log('Failed to add a node');
      }
    })
  } catch (error) {
    console.log(error);
  }
  size = driver.controller.nodes.size;
  ownId = driver.controller.ownNodeId;
  console.log('\n\n\n\n\n\n\n # of nodes: ' + size);
  console.log('\n Controller id: ' + ownId);
  if (size > 1 && interval) {
    clearInterval(interval);
    interval = null;
  }
}

// Listen for the driver ready event before doing anything with the driver
driver.once('driver ready', () => {
  // After a node was interviewed, it is safe to control it
  const node = driver.controller.nodes.get(4);
  node.once('interview completed', subNode => {
    console.log('\n\n\n\n\n\n\n\n subNode ids: ' + node.getDefinedValueIDs());
  });
  // attempt to read values from node on value added
  node.once('value added', (subNode, args) => {
    console.log('\n\n\n\n\n\n\n\n subNode Updated: ' + args.newValue);
  });
  // attempt to read values from node on value updated
  node.once('value updated', (subNode, args) => {
    console.log('\n\n\n\n\n\n\n\n subNode Updated: ' + args.newValue);
  });
});

// Start the driver. To await this method, put this line into an async method
driver.start()
  .then(() => {
    console.log('Driver Started');
  })
  .catch(err => {
    console.log(err);
  })
