# Preenche uma cópia de demonstração (VALORES DE EXEMPLO), recalcula no LibreOffice em pt-BR e
# exporta PNG das abas usadas nos vídeos. Uso: capturas.py <xlsx> <pasta_saida> <perfil_lo>
import sys, os, subprocess, glob
from openpyxl import load_workbook
SRC, OUT, PROFILE = sys.argv[1:4]
os.makedirs(OUT, exist_ok=True)
wb = load_workbook(SRC)
c = wb['Custos do mês']; c['B3'] = 2000; c['B4'] = 120; c['B7'] = 120; c['B8'] = 150; c['B11'] = 90
precos = {'Leite condensado': 7, 'Manteiga sem sal': 9, 'Chocolate em pó 50%': 8, 'Granulado': 12, 'Coco ralado': 5,
          'Farinha de trigo': 6, 'Açúcar refinado': 5, 'Ovos': 12, 'Leite integral': 5.5, 'Óleo': 8, 'Fermento químico': 4,
          'Creme de leite': 3.5, 'Forminha nº 4': 6, 'Pote 250 ml com tampa': 1.2, 'Colher descartável': 5}
i = wb['Insumos']
for r in range(5, 105):
    if i[f'A{r}'].value in precos: i[f'D{r}'] = precos[i[f'A{r}'].value]
fichas = [
    ('Brigadeiro', 50, 90, 0.06, [('Leite condensado', 790), ('Manteiga sem sal', 20), ('Chocolate em pó 50%', 40), ('Granulado', 120)], 1.5),
    ('Beijinho', 50, 90, 0.06, [('Leite condensado', 790), ('Manteiga sem sal', 20), ('Coco ralado', 100)], 1.5),
    ('Bolo de pote', 12, 150, 1.3, [('Farinha de trigo', 240), ('Açúcar refinado', 300), ('Ovos', 3), ('Leite integral', 240), ('Óleo', 120),
                                    ('Fermento químico', 15), ('Chocolate em pó 50%', 160), ('Leite condensado', 790), ('Creme de leite', 200)], 10),
]
for n, (nome, rend, tempo, emb, ings, hoje) in enumerate(fichas, start=1):
    f = wb[f'Ficha {n}']; f['B2'] = nome; f['B3'] = rend; f['B4'] = tempo; f['B5'] = emb; f['B36'] = hoje
    for r, (ing, q) in enumerate(ings, start=8): f[f'A{r}'] = ing; f[f'B{r}'] = q
wb.save(f'{OUT}/demo.xlsx')
lo = ['soffice', f'-env:UserInstallation=file://{PROFILE}', '--headless']
subprocess.run(lo + ['--calc', '--convert-to', 'xlsx:Calc MS Excel 2007 XML', '--outdir', f'{OUT}/calc', f'{OUT}/demo.xlsx'], check=True, capture_output=True)
subprocess.run(lo + ['--convert-to', 'pdf', '--outdir', OUT, f'{OUT}/calc/demo.xlsx'], check=True, capture_output=True)
pdf = f'{OUT}/demo.pdf'
n = int([l for l in subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout.splitlines() if l.startswith('Pages')][0].split()[-1])
alvo = {'Custos do mês': 'custos', 'Insumos e embalagens': 'insumos', 'Ficha 1 ·': 'ficha1', 'Ficha 3 ·': 'ficha3', 'Tabela de preços': 'tabela'}
for p in range(1, n + 1):
    t = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), pdf, '-'], capture_output=True, text=True).stdout
    for k, nome in alvo.items():
        if t.lstrip().startswith(k) and not os.path.exists(f'{OUT}/{nome}.png'):
            subprocess.run(['pdftoppm', '-f', str(p), '-l', str(p), '-r', '200', '-png', '-singlefile', pdf, f'{OUT}/{nome}'], check=True)
print(sorted(os.path.basename(x) for x in glob.glob(f'{OUT}/*.png')))
