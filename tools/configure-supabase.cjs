/* Emit only public config; secret keys and malformed URLs are rejected. */
const fs = require('fs'), path = require('path');
const url = new URL(process.env.SUPABASE_URL || '');
const key = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const local = ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
if ((url.protocol !== 'https:' && !(local && url.protocol === 'http:')) || url.username || url.password || url.search || url.hash || url.pathname !== '/' || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) throw Error('Use a Supabase origin and a public sb_publishable_ key only.');
fs.writeFileSync(path.resolve(__dirname,'../js/supabase-config.js'), '/* Generated PUBLIC browser configuration. */\nwindow.TamOiSupabaseConfig = Object.freeze(' + JSON.stringify({SUPABASE_URL:url.origin,SUPABASE_PUBLISHABLE_KEY:key},null,2) + ');\n');
console.log('Public Supabase configuration written. No secrets are emitted.');
