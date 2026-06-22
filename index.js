const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_PATH)) {
    const init = {
      hero: {
        name: 'Rendy Wijaya Pranata',
        role: 'Web Developer | SMKN 1 Ciomas XI PPLG 1',
        descriptionHtml:
          'I am also learning and developing my skills in <b>Full Stack Web Development</b> using <b>React.js</b> for frontend and <b>Node.js + Express</b> for backend, as well as <b>MongoDB</b> for the database.<br><br>Additionally, I am familiar with tools like <b>VS Code</b> and <b>Laragon</b> for local development, as well as frameworks like <b>Bootstrap</b> and <b>Tailwind CSS</b> for building modern, responsive, and efficient interfaces.'
      },
      about: {
        aboutTitle: 'About Me',
        aboutParagraphHtml:
          'I am <b>Rendy Wijaya Pranata</b>, a student from <b>SMKN 1 Ciomas</b> majoring in <b>XI PPLG 1</b>. I focus on Web Development and am currently deepening my knowledge in HTML, CSS, JavaScript, and Laravel.',
        statsTitle: 'My Stats',
        stats: [
          { icon: 'fa-fire', label: '1 Projects Completed' },
          { icon: 'fa-bolt', label: '2+ Years Learning' },
          { icon: 'fa-laptop-code', label: 'Fullstack Developer' },
          { icon: 'fa-code-branch', label: 'Active on GitHub' }
        ],
        whatIdoTitle: 'What I Do',
        whatIdoParagraphHtml:
          '<b>Frontend Development</b> — Building modern, responsive, and interactive UI.<br><br><b>Backend Development</b> — Building API systems, databases, and application logic.<br><br><b>Fullstack App</b> — Working on projects from frontend to backend end-to-end.'
      },
      projects: [
        {
          title: 'Luxora Olshop',
          stack: 'PHP Native, MySQL, HTML, CSS, JavaScript',
          desc: 'Simple E-Commerce based on PHP Native with product management system, shopping cart, checkout, product image upload, as well as order and transaction system.',
          features: [
            'Product CRUD (Create, Read, Update, Delete)',
            'Cart & Checkout',
            'Product Image Upload',
            'Order & Transaction System',
            'Inventory management'
          ]
        },
        {
          title: 'Raff Food & Cake',
          stack: 'Laravel 12, MySQL, Midtrans, Bootstrap',
          desc: 'E-Commerce application for MSME food & cake businesses with integrated online payment system using Midtrans Payment Gateway.',
          features: [
            'Payment Gateway System (Midtrans)',
            'Complete Admin Dashboard',
            'Real-time Order & Payment Status',
            'Product & Category Management',
            'Sales Report'
          ]
        },
        {
          title: 'Finance Dashboard',
          stack: 'React.js, Node.js, Express.js, MongoDB',
          desc: 'Modern financial dashboard for personal or small business financial data management with interactive interface.',
          features: [
            'Financial data management (income & expenses)',
            'API Integration',
            'Modern & interactive UI with Chart.js',
            'Filter & search data',
            'Export reports'
          ]
        },
        {
          title: 'Item Borrowing Website',
          stack: 'Laravel 12, MySQL, Blade, Bootstrap',
          desc: 'Item borrowing information system for institutions or schools with multi-role authentication.',
          features: [
            'Item borrowing & return system',
            'Login & multi-user authentication',
            'User & item data management',
            'Borrowing status notifications',
            'Borrowing history'
          ]
        },
        {
          title: 'Book Store Website',
          stack: 'HTML, CSS, JavaScript (Vanilla)',
          desc: 'Responsive static book store catalog website with search and category filter features.',
          features: [
            'Real-time product search',
            'Category filter feature',
            'Responsive design (Mobile Friendly)',
            'Simple shopping cart (localStorage)',
            'Smooth animations with CSS'
          ]
        },
        {
          title: 'Student Attendance System',
          stack: 'PHP Native / Laravel, MySQL',
          desc: 'Digital attendance application for schools with multi-user support (Admin & Student) with automatic recap.',
          features: [
            'Multi User Login (Admin & Student)',
            'Daily Attendance (Present, Permission, Absent, Sick)',
            'Monthly & semester attendance recap',
            'Export data to PDF/Excel',
            'Late notification'
          ]
        }
      ],
      footer: {
        name: 'Rendy Wijaya Pranata',
        role: 'Fullstack Web Developer',
        socials: [
          { type: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/renrendy/' },
          { type: 'whatsapp', label: 'WhatsApp', href: 'https://wa.me/6285880012936' },
          { type: 'email', label: 'Email', href: 'mailto:rendiwijayapranata2211@gmail.com' }
        ],
        copy: '© 2026 Rendy Wijaya Pranata'
      }
    };

    fs.writeFileSync(DATA_PATH, JSON.stringify(init, null, 2), 'utf8');
  }
}

ensureDataFile();

/* ================= DATA FUNCTIONS ================= */
function loadData() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

/* ================= AUTH ================= */
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'rendi!!!';

function checkAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');

  if (token !== ADMIN_PASSWORD) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  next();
}

/* ================= API ================= */
app.get('/api/site-data', (req, res) => {
  try {
    res.json(loadData());
  } catch {
    res.status(500).json({ message: 'Failed to load data' });
  }
});

app.get('/api/admin/site-data', checkAuth, (req, res) => {
  try {
    res.json(loadData());
  } catch {
    res.status(500).json({ message: 'Failed to load data' });
  }
});

app.put('/api/admin/site-data', checkAuth, (req, res) => {
  try {
    const data = req.body;

    if (!data || typeof data !== 'object') {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    saveData(data);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ message: 'Failed to save data' });
  }
});

/* ================= STATIC FILES ================= */
// INI KUNCI UTAMA (FIX NOT FOUND)
app.use(express.static(__dirname));

/* ================= TEST ROUTE ================= */
app.get('/test', (req, res) => {
  res.send('SERVER HIDUP');
});

/* ================= START SERVER ================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
