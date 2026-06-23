/**
 *
 * index.js
 * This is the entry file for the application
 */

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
