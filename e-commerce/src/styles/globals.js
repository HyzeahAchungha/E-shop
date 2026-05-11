export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap');

  * { box-sizing: border-box; }
  body { margin: 0; }

  .nav-link {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #1a1a1a;
    text-decoration: none;
    cursor: pointer;
    padding: 4px 0;
    position: relative;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    width: 0;
    height: 1px;
    background: #1a1a1a;
    transition: width 0.3s ease;
  }
  .nav-link:hover::after { width: 100%; }

  .btn-primary {
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    background: transparent;
    border: 1px solid #1a1a1a;
    color: #1a1a1a;
    padding: 11px 28px;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .btn-primary:hover { background: #1a1a1a; color: #fff; }

  .btn-dark {
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    background: #1a1a1a;
    border: 1px solid #1a1a1a;
    color: #fff;
    padding: 11px 28px;
    cursor: pointer;
    transition: all 0.25s ease;
  }
  .btn-dark:hover { background: #333; }

  .section-label {
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #999;
  }
  .section-title {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 28px;
    font-weight: 400;
    letter-spacing: 0.04em;
    margin: 0 0 32px;
    color: #1a1a1a;
  }

  .coll-item { position: relative; overflow: hidden; cursor: pointer; }
  .coll-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; display: block; }
  .coll-item:hover img { transform: scale(1.05); }
  .coll-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.38) 0%, transparent 55%);
    display: flex; align-items: flex-end; padding: 20px;
  }
  .coll-label {
    font-family: 'Jost', sans-serif;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #fff;
    background: rgba(255,255,255,0.15);
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255,255,255,0.4);
    padding: 7px 18px;
    transition: background 0.2s;
  }
  .coll-item:hover .coll-label { background: rgba(255,255,255,0.28); }

  .social-img { width: 100%; aspect-ratio: 1; object-fit: cover; transition: transform 0.5s, filter 0.4s; filter: grayscale(20%); cursor: pointer; }
  .social-img:hover { transform: scale(1.04); filter: grayscale(0%); }

  .footer-link {
    font-family: 'Jost', sans-serif;
    font-size: 11.5px;
    letter-spacing: 0.04em;
    color: #888;
    text-decoration: none;
    display: block;
    margin-bottom: 8px;
    cursor: pointer;
    transition: color 0.2s;
  }
  .footer-link:hover { color: #1a1a1a; }

  input[type=email] {
    font-family: 'Jost', sans-serif;
    font-size: 12px;
    border: none;
    border-bottom: 1px solid rgba(255,255,255,0.4);
    background: transparent;
    color: #fff;
    padding: 8px 0;
    outline: none;
    flex: 1;
    letter-spacing: 0.06em;
  }
  input[type=email]::placeholder { color: rgba(255,255,255,0.5); }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f5f3ef; }
  ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
`;