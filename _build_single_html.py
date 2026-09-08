# -*- coding: utf-8 -*-
# 把 prototype/ 打包成单个自包含 HTML：内联 CSS/JS，SVG 路径转 data URI。
# 生成后用浏览器直接打开即可试玩，无需安装、无需服务器、file:// 可用。
# 用法：python prototype/_build_single_html.py
import re, base64, os, pathlib

ROOT = pathlib.Path(__file__).resolve().parent          # prototype/
INDEX = ROOT / 'index.html'
OUT = ROOT.parent / '彩虹小画家.html'                    # 仓库根目录

def data_uri(rel):
    p = ROOT / rel
    if not p.exists():
        return rel
    b64 = base64.b64encode(p.read_bytes()).decode()
    mime = 'audio/wav' if p.suffix == '.wav' else 'image/svg+xml'
    return 'data:' + mime + ';base64,' + b64

def rewrite_svg_paths(text):
    return re.sub(r'assets/[A-Za-z0-9_/\-]+\.(?:svg|wav)', lambda m: data_uri(m.group(0)), text)

def inline(html):
    def link_repl(m):
        href = m.group(1); p = ROOT / href
        return '<style>\n' + p.read_text(encoding='utf-8') + '\n</style>' if p.exists() else m.group(0)
    html = re.sub(r'<link[^>]*href="([^"]+)"[^>]*>', link_repl, html)
    def script_repl(m):
        src = m.group(1); p = ROOT / src
        if not p.exists(): return m.group(0)
        return '<script>\n' + rewrite_svg_paths(p.read_text(encoding='utf-8')) + '\n</script>'
    html = re.sub(r'<script[^>]*src="([^"]+)"[^>]*>\s*</script>', script_repl, html)
    return html

html = INDEX.read_text(encoding='utf-8')
html = inline(html)
html = rewrite_svg_paths(html)
OUT.write_text(html, encoding='utf-8')
n_data = html.count('data:image/svg+xml;base64,')
n_ext = len(re.findall(r'(?:src|href)="(?!data:)[^"]+"', html))
print('wrote', OUT, os.path.getsize(OUT), 'bytes | svg data-uri:', n_data, '| 剩余外部引用:', n_ext)
