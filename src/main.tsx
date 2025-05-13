import React from 'react';
import './public-path';  // For proper Qiankun integration
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import Cookies from 'js-cookie';
//import Cookies from 'js-cookie';


// Store the root instance for proper unmounting
let root: ReturnType<typeof createRoot> | null = null;

const deploymentMode = import.meta.env.VITE_DEPLOYMENT_MODE;

// const userId = '681a91212c1ca099fe2b17df';
// Cookies.set('userId', userId, { expires: 7 }); // Expire dans 7 jours
// const storedUserId = Cookies.get('userId');
// console.log('Stored userId from cookie:', storedUserId);
if (deploymentMode !== 'standalone') {
  const userId = Cookies.get('userId');
  console.log('Stored userId from cookie:', userId);
} else {
  const userId = '681a91212c1ca099fe2b17df';
}


function render(props: { container?: HTMLElement }) {
  const { container } = props;
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (rootElement) {
    console.log('[App4] Rendering in container:', rootElement);
    // Create the root instance if it doesn't exist
    if (!root) {
      root = createRoot(rootElement);
    }
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.warn('[App4] Root element not found!');
  }
}

export async function bootstrap() {
  console.time('[App4] bootstrap');
  console.log('[App4] Bootstrapping...');
  return Promise.resolve();
}

export async function mount(props: any) {
  console.log('[App4] Mounting...', props);
  const { container } = props;
  if (container) {
    console.log('[App4] Found container for mounting:', container);
  } else {
    console.warn('[App4] No container found for mounting');
  }
  render(props);
  return Promise.resolve();
}

export async function unmount(props: any) {
  console.log('[App4] Unmounting...', props);
  const { container } = props;
  const rootElement = container
    ? container.querySelector('#root')
    : document.getElementById('root');

  if (rootElement && root) {
    console.log('[App4] Unmounting from container:', rootElement);
    root.unmount();
    root = null;  // Reset the root instance
  } else {
    console.warn('[App4] Root element not found for unmounting!');
  }
  return Promise.resolve();
}

// Standalone mode: If the app is running outside Qiankun, it will use this code
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  console.log('[App4] Running in standalone mode');
  render({});
} else {
  console.log('[App4] Running inside Qiankun');
  // Qiankun will control the lifecycle
  render({});
}
