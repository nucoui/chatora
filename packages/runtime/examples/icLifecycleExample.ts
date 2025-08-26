/**
 * Example demonstrating the improved IC lifecycle functionality
 * This would be the kind of code users can now write
 */
import { onICConnected, onICDisconnected } from "../src/main";
import type { IC } from "../src/main";

// Example IC with lifecycle hooks - this is now possible!
const CounterComponent: IC<{ initialCount?: number }> = ({ initialCount = 0 }) => {
  console.log('IC function called - this should only happen once per unique props!');
  
  let count = initialCount;
  
  // Now ICs can use lifecycle hooks like CCs!
  onICConnected(() => {
    console.log('Counter connected to DOM');
    // Could setup event listeners, start timers, etc.
  });
  
  onICDisconnected(() => {
    console.log('Counter disconnected from DOM');
    // Could cleanup resources, remove listeners, etc.
  });
  
  return () => {
    console.log('Render function called - this may happen multiple times');
    return {
      tag: "div",
      props: {
        children: [
          `Count: ${count}`,
          {
            tag: "button",
            props: {
              children: ["Increment"],
              onClick: () => {
                count++;
                // In a real app, this would trigger a re-render
              }
            }
          }
        ]
      }
    };
  };
};

// Example IC that uses multiple lifecycle hooks
const DataComponent: IC<{ endpoint: string }> = ({ endpoint }) => {
  console.log(`DataComponent created for endpoint: ${endpoint}`);
  
  let data: any = null;
  let isLoading = false;
  
  onICConnected(async () => {
    console.log('Starting data fetch...');
    isLoading = true;
    
    try {
      // Simulate API call
      const response = await fetch(endpoint);
      data = await response.json();
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      isLoading = false;
    }
  });
  
  onICDisconnected(() => {
    console.log('Cleaning up data component');
    data = null;
  });
  
  return () => {
    if (isLoading) {
      return {
        tag: "div",
        props: { children: ["Loading..."] }
      };
    }
    
    if (data) {
      return {
        tag: "div",
        props: { children: [JSON.stringify(data)] }
      };
    }
    
    return {
      tag: "div",
      props: { children: ["No data"] }
    };
  };
};

export { CounterComponent, DataComponent };