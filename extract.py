import os
import re

base_dir = r"c:\Users\lenovo\Downloads\Stage\App_code\src\main\resources\static\admin"
html_dir = os.path.join(base_dir, "html")
css_dir = os.path.join(base_dir, "css")
js_dir = os.path.join(base_dir, "js")

# S'assurer que les répertoires css et js existent
os.makedirs(css_dir, exist_ok=True)
os.makedirs(js_dir, exist_ok=True)

files_to_process = [
    "accident.html",
    "reparation.html",
    "vidange.html",
    "depanage.html",
    "dashboard.html"
]

style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL | re.IGNORECASE)
script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL | re.IGNORECASE)

for filename in files_to_process:
    filepath = os.path.join(html_dir, filename)
    if not os.path.exists(filepath):
        print(f"Fichier introuvable : {filepath}")
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    basename = os.path.splitext(filename)[0]
    
    # Extraire et remplacer <style>
    style_match = style_pattern.search(content)
    if style_match:
        css_content = style_match.group(1).strip()
        css_filepath = os.path.join(css_dir, f"{basename}.css")
        with open(css_filepath, 'w', encoding='utf-8') as f_css:
            f_css.write(css_content)
        print(f"Créé : {css_filepath}")
        
        # Remplacer la balise <style> par <link>
        link_tag = f'<link rel="stylesheet" href="../css/{basename}.css">'
        content = style_pattern.sub(link_tag, content, count=1)

    # Extraire et remplacer <script>
    script_match = script_pattern.search(content)
    if script_match:
        js_content = script_match.group(1).strip()
        js_filepath = os.path.join(js_dir, f"{basename}.js")
        with open(js_filepath, 'w', encoding='utf-8') as f_js:
            f_js.write(js_content)
        print(f"Créé : {js_filepath}")
        
        # Remplacer la balise <script> par <script src="...">
        script_tag = f'<script src="../js/{basename}.js"></script>'
        content = script_pattern.sub(script_tag, content, count=1)

    # Sauvegarder le fichier HTML modifié
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Mise à jour de : {filepath}\n")

print("Extraction terminée avec succès !")
