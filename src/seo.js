import { dP, dCo } from './data/db.js';
import { L, getLang } from './i18n.js';

export const BASE_URL = 'https://jidoka.co.id';

export const ROUTE_META = {
  home: {
    title: {
      en: 'PT Jidoka Result Indonesia — Industrial Packaging Manufacturer',
      id: 'PT Jidoka Result Indonesia — Produsen Kemasan Industri'
    },
    desc: {
      en: 'PT Jidoka Result Indonesia (JRI) — industrial packaging manufacturer in Cikarang, Bekasi. Karton box, imprabox, partition & custom packaging. Package Your Quality.',
      id: 'PT Jidoka Result Indonesia (JRI) — produsen kemasan industri di Cikarang, Bekasi. Karton box, imprabox, partisi & custom packaging. Package Your Quality.'
    }
  },
  products: {
    title: {
      en: 'Industrial Packaging Products — Corrugated, Imprabox, PE Sheet | JRI',
      id: 'Produk Kemasan Industri — Karton Box, Imprabox, PE Sheet | JRI'
    },
    desc: {
      en: 'Explore JRI industrial packaging products: karton box corrugated, imprabox PP, partition, and PE sheet engineered for manufacturing and automotive logistics.',
      id: 'Katalog lengkap produk packaging industri JRI: karton box korugasi, imprabox PP, partisi, dan lembaran PE untuk manufaktur dan logistik otomotif.'
    }
  },
  application: {
    title: {
      en: 'Industrial Packaging Applications — Automotive, Steel & Manufacturing | JRI',
      id: 'Aplikasi Kemasan Industri — Otomotif, Baja & Manufaktur | JRI'
    },
    desc: {
      en: 'Packaging solutions tailored for automotive parts, steel coils, heavy industrial logistics, and sensitive manufacturing components.',
      id: 'Solusi kemasan industri spesifik untuk komponen otomotif, gulungan baja, logistik beban berat, dan komponen manufaktur presisi.'
    }
  },
  manufacturing: {
    title: {
      en: 'Manufacturing Capabilities & Digital Factory Tour | PT Jidoka Result Indonesia',
      id: 'Kapabilitas Manufaktur & Tur Digital Pabrik | PT Jidoka Result Indonesia'
    },
    desc: {
      en: 'Explore JRI 5-stage production flow, advanced corrugator machinery, automated flexo printers, and JICOS real-time quality control system.',
      id: 'Jelajahi alur produksi 5 tahap JRI, mesin cetak flexo modern, corrugator berkapasitas tinggi, dan kendali mutu terintegrasi JICOS.'
    }
  },
  quality: {
    title: {
      en: 'Quality Assurance System — 3-Stage Inspection & Standards | JRI',
      id: 'Sistem Manajemen Mutu — Inspeksi 3 Tahap & Standar Mutu | JRI'
    },
    desc: {
      en: 'Strict packaging quality assurance: raw material verification, in-process control, burst & BCT testing, ISO compliance, and Japanese zero-defect commitment.',
      id: 'Jaminan mutu packaging ketat: verifikasi bahan baku, uji burst & BCT, kepatuhan standar ISO, dan komitmen nol cacat berdisiplin Jepang.'
    }
  },
  way: {
    title: {
      en: 'Our Way — Japanese Manufacturing DNA & 7 Operating Principles | JRI',
      id: 'Our Way — DNA Manufaktur Jepang & 7 Prinsip Kerja | JRI'
    },
    desc: {
      en: 'Discover JRI core principles: Kaizen, 5S, Jidoka, Heijunka, Standardization, Safety, and People Development driving our industrial packaging excellence.',
      id: 'Tujuh prinsip kerja fundamental JRI: Kaizen, 5S, Jidoka, Heijunka, Standardisasi, Safety, dan Pengembangan SDM dalam keunggulan manufaktur.'
    }
  },
  corporate: {
    title: {
      en: 'Corporate Profile, Governance & Timeline | PT Jidoka Result Indonesia',
      id: 'Profil Perusahaan, Tata Kelola & Sejarah | PT Jidoka Result Indonesia'
    },
    desc: {
      en: 'PT Jidoka Result Indonesia corporate overview, milestone history, executive management, sustainability initiatives, and corporate governance.',
      id: 'Profil korporat PT JRI, tonggak sejarah pendirian, jajaran manajemen, inisiatif keberlanjutan lingkungan, dan tata kelola perusahaan.'
    }
  },
  partnership: {
    title: {
      en: 'Partnership & Investor Relations | PT Jidoka Result Indonesia',
      id: 'Kemitraan & Hubungan Investor | PT Jidoka Result Indonesia'
    },
    desc: {
      en: 'Strategic collaboration opportunities for industrial customers, raw material suppliers, technical partners, and holding investment.',
      id: 'Peluang kolaborasi strategis untuk pelanggan industri, pemasok bahan baku, mitra teknologi, dan investasi holding.'
    }
  },
  resources: {
    title: {
      en: 'Resource Center & Technical Documents Download | JRI',
      id: 'Pusat Sumber Daya & Unduh Dokumen Teknis | JRI'
    },
    desc: {
      en: 'Download product catalogs, technical packaging specifications, company profile PDF, and quality certificates from PT Jidoka Result Indonesia.',
      id: 'Unduh katalog produk, spesifikasi teknis kemasan, company profile resmi (PDF), dan sertifikasi mutu PT Jidoka Result Indonesia.'
    }
  },
  contact: {
    title: {
      en: 'Contact & Request for Quotation (RFQ) | PT Jidoka Result Indonesia',
      id: 'Kontak & Permintaan Penawaran Harga (RFQ) | PT Jidoka Result Indonesia'
    },
    desc: {
      en: 'Submit a structured RFQ, product inquiry, or corporate consultation. Direct contact with sales engineering and Cikarang plant.',
      id: 'Kirim permintaan penawaran harga (RFQ) terstruktur, inquiry produk, atau konsultasi langsung dengan tim sales engineering pabrik Cikarang.'
    }
  },
  admin: {
    title: {
      en: 'Admin CMS | PT Jidoka Result Indonesia',
      id: 'Admin CMS | PT Jidoka Result Indonesia'
    },
    desc: {
      en: 'Content Management System and Lead Management for PT Jidoka Result Indonesia portal.',
      id: 'Sistem Manajemen Konten dan Pengelolaan Lead portal PT Jidoka Result Indonesia.'
    }
  }
};

export function getRouteMeta(page, seg = [], lang = getLang()) {
  const isId = lang === 'id';
  let title = '';
  let desc = '';
  let canonicalPath = `#/${page}`;

  if (page === 'product' && seg[1]) {
    const products = dP() || [];
    const p = products.find(x => x.id === seg[1]);
    if (p) {
      const pName = p.name;
      title = isId
        ? `${pName} — Spesifikasi & Kapabilitas Manufaktur | JRI`
        : `${pName} — Technical Specification & Manufacturing | JRI`;
      const leadText = p.lead ? (isId ? p.lead.id : p.lead.en) : '';
      desc = leadText || (isId
        ? `Spesifikasi teknis, material ${p.material || ''}, dan kapabilitas manufaktur kemasan ${pName} dari PT Jidoka Result Indonesia.`
        : `Technical specifications, material ${p.material || ''}, and manufacturing capability for ${pName} by PT Jidoka Result Indonesia.`);
      canonicalPath = `#/product/${p.id}`;
    } else {
      title = isId ? 'Produk Tidak Ditemukan | JRI' : 'Product Not Found | JRI';
      desc = 'Packaging product not found.';
    }
  } else if (ROUTE_META[page]) {
    const m = ROUTE_META[page];
    title = isId ? m.title.id : m.title.en;
    desc = isId ? m.desc.id : m.desc.en;
    if (seg[1] && page === 'contact') {
      canonicalPath = `#/contact/${seg[1]}`;
    }
  } else {
    const m = ROUTE_META.home;
    title = isId ? m.title.id : m.title.en;
    desc = isId ? m.desc.id : m.desc.en;
    canonicalPath = '#/home';
  }

  const canonical = `${BASE_URL}/${canonicalPath}`;
  const ogImage = `${BASE_URL}/og-image.png`;

  return {
    title,
    desc,
    canonical,
    ogImage,
    lang
  };
}

export function buildJSONLD(page, seg = [], lang = getLang()) {
  const co = dCo() || {};
  const isId = lang === 'id';

  // 1. Organization Schema (always included)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'PT Jidoka Result Indonesia',
    alternateName: ['Jidoka Result Indonesia', 'PT JRI', 'JRI Packaging'],
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: isId
      ? 'Produsen solusi kemasan industri manufaktur dan otomotif dengan sistem JICOS dan motto PACKAGE YOUR QUALITY.'
      : 'Industrial packaging manufacturer for manufacturing & automotive sectors with JICOS control system and PACKAGE YOUR QUALITY motto.',
    slogan: 'PACKAGE YOUR QUALITY',
    telephone: co.phone || '+62-21-8983-0000',
    email: co.sales || 'sales@jidoka.co.id',
    address: {
      '@type': 'PostalAddress',
      streetAddress: co.addr || 'Kawasan Industri Cikarang',
      addressLocality: 'Bekasi',
      addressRegion: 'Jawa Barat',
      postalCode: '17530',
      addressCountry: 'ID'
    },
    foundingLocation: 'Cikarang, Bekasi, Indonesia',
    knowsAbout: [
      'Corrugated Cardboard Box',
      'Imprabox PP Flute',
      'Industrial Partitions',
      'PE Sheet and Film',
      'Automotive Packaging Engineering',
      'Japanese Monozukuri & Kaizen Discipline'
    ]
  };

  // 2. BreadcrumbList Schema
  const breadcrumbs = [
    {
      '@type': 'ListItem',
      position: 1,
      name: isId ? 'Beranda' : 'Home',
      item: `${BASE_URL}/#/home`
    }
  ];

  if (page === 'products') {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 2,
      name: isId ? 'Produk' : 'Products',
      item: `${BASE_URL}/#/products`
    });
  } else if (page === 'product' && seg[1]) {
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 2,
      name: isId ? 'Produk' : 'Products',
      item: `${BASE_URL}/#/products`
    });
    const p = (dP() || []).find(x => x.id === seg[1]);
    if (p) {
      breadcrumbs.push({
        '@type': 'ListItem',
        position: 3,
        name: p.name,
        item: `${BASE_URL}/#/product/${p.id}`
      });
    }
  } else if (page !== 'home') {
    const meta = ROUTE_META[page];
    breadcrumbs.push({
      '@type': 'ListItem',
      position: 2,
      name: meta ? (isId ? meta.title.id.split(' — ')[0].split(' | ')[0] : meta.title.en.split(' — ')[0].split(' | ')[0]) : page,
      item: `${BASE_URL}/#/${page}`
    });
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs
  };

  const schemas = [organizationSchema, breadcrumbSchema];

  // 3. Product Schema (when on product detail page)
  if (page === 'product' && seg[1]) {
    const p = (dP() || []).find(x => x.id === seg[1]);
    if (p) {
      const productSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        category: p.cat ? (isId ? p.cat.id : p.cat.en) : 'Industrial Packaging',
        description: p.lead ? (isId ? p.lead.id : p.lead.en) : p.name,
        material: p.material || 'Corrugated / PP Flute / PE',
        brand: {
          '@type': 'Brand',
          name: 'PT Jidoka Result Indonesia'
        },
        manufacturer: {
          '@id': `${BASE_URL}/#organization`
        },
        offers: {
          '@type': 'Offer',
          url: `${BASE_URL}/#/contact/rfq?product=${p.id}`,
          priceCurrency: 'IDR',
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition'
        }
      };
      schemas.push(productSchema);
    }
  }

  return schemas;
}

function setMetaTag(attrName, attrValue, content) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonicalTag(url) {
  if (typeof document === 'undefined') return;
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

export function updateSEO(page, seg = [], lang = getLang()) {
  if (typeof document === 'undefined') return;

  const { title, desc, canonical, ogImage } = getRouteMeta(page, seg, lang);

  // Document title & lang attribute
  document.title = title;
  document.documentElement.lang = lang;

  // Standard Meta Tags
  setMetaTag('name', 'description', desc);
  setCanonicalTag(canonical);

  // Open Graph
  setMetaTag('property', 'og:title', title);
  setMetaTag('property', 'og:description', desc);
  setMetaTag('property', 'og:url', canonical);
  setMetaTag('property', 'og:type', page === 'product' ? 'product' : 'website');
  setMetaTag('property', 'og:site_name', 'PT Jidoka Result Indonesia');
  setMetaTag('property', 'og:image', ogImage);

  // Twitter Card
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', title);
  setMetaTag('name', 'twitter:description', desc);
  setMetaTag('name', 'twitter:image', ogImage);

  // JSON-LD Script tag
  const jsonLd = buildJSONLD(page, seg, lang);
  let scriptEl = document.getElementById('jri-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'jri-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLd, null, 2);
}
