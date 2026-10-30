"""Optional source ZIP packaging; requires Python 3, no third-party packages."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib

root = Path(__file__).resolve().parents[1]
archive = root.parent / 'SONSUZ-FRAKTAL-EVRENI.zip'
excluded = {'node_modules', 'test-results', '.git', '__pycache__'}
files = [p for p in root.rglob('*') if p.is_file() and not (set(p.relative_to(root).parts) & excluded) and p.suffix not in {'.log', '.pyc'}]
with ZipFile(archive, 'w', ZIP_DEFLATED) as z:
    for p in sorted(files):
        z.write(p, Path(root.name) / p.relative_to(root))
with ZipFile(archive) as z:
    assert z.testzip() is None
    for name in ['package.json', 'README.md', 'BASLAT.cmd', 'dist/index.html', 'src/App.tsx', 'src/engine/fractal.worker.ts', 'tests/math.test.ts']:
        assert f'{root.name}/{name}' in z.namelist(), name
    assert not any('node_modules' in p for p in z.namelist())
print(f'{len(files)} dosya; {archive.stat().st_size} bayt; ZIP bütünlüğü doğrulandı.')
print(f'SHA256 {hashlib.sha256(archive.read_bytes()).hexdigest()}')
