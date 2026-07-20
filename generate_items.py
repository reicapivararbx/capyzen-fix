#!/usr/bin/env python3
"""
Gerador de 1000 itens para o jogo CapyZen
Categorias: Comidas (400), Boosts (300), Roupas (200), Acessórios (100)
"""

import random

def generate_foods(count=400):
    """Gera lista de comidas variadas."""
    base_fruits = [
        "Maçã", "Banana", "Pêssego", "Morango", "Uva", "Laranja", "Abacaxi",
        "Manga", "Pera", "Melancia", "Kiwi", "Limão", "Coco", "Framboesa",
        "Amora", "Cereja", "Mirtilo", "Goiaba", "Maracujá", "Pitaya",
        "Melão", "Caqui", "Figo", "Romã", "Tangerina", "Jabuticaba",
        "Açaí", "Caju", "Groselha", "Physalis"
    ]
    
    vegetables = [
        "Cenoura", "Brócolis", "Espinafre", "Tomate", "Batata", "Cebola",
        "Alho", "Pimentão", "Abobrinha", "Berinjela", "Couve", "Alface",
        "Repolho", "Beterraba", "Rabanete", "Pepino", "Milho", "Ervilha",
        "Vagem", "Cogumelo", "Aspargo", "Aipo", "Nabo", "Inhame",
        "Batata-doce", "Mandioca", "Gengibre", "Cúrcuma", "Curry", "Orégano"
    ]
    
    meats = [
        "Frango", "Carne bovina", "Peixe", "Porco", "Cordeiro", "Peru",
        "Pato", "Coelho", "Veado", "Avestruz", "Salmão", "Atum",
        "Camarão", "Lagosta", "Caranguejo", "Mexilhão", "Ostra", "Lula",
        "Polvo", "Tilápia", "Sardinha", "Bacalhau", "Robalo", "Dourado"
    ]
    
    dairy = [
        "Leite", "Queijo", "Iogurte", "Manteiga", "Creme de leite",
        "Ricota", "Mozzarella", "Cheddar", "Parmesão", "Gouda",
        "Brie", "Camembert", "Feta", "Gorgonzola", "Requeijão"
    ]
    
    grains = [
        "Arroz", "Feijão", "Lentilha", "Grão-de-bico", "Ervilha",
        "Trigo", "Aveia", "Centeio", "Cevada", "Milho",
        "Quinoa", "Amaranto", "Chia", "Linhaça", "Gergelim"
    ]
    
    snacks = [
        "Pipoca", "Batata frita", "Pretzel", "Nachos", "Batata chips",
        "Amendoim", "Castanha", "Noz", "Pistache", "Amêndoa",
        "Trail mix", "Granola bar", "Cookie", "Biscoito", "Cracker",
        "Pão de queijo", "Coxinha", "Pastel", "Empada", "Esfiha"
    ]
    
    desserts = [
        "Bolo", "Torta", "Sorvete", "Pudim", "Mousse",
        "Brigadeiro", "Beijinho", "Paçoca", "Pé-de-moleque", "Romeu e Julieta",
        "Churros", "Waffle", "Panqueca", "Crepe", "Gelatina",
        "Brownie", "Cheesecake", "Tiramisu", "Pavê", "Canudinho"
    ]
    
    beverages = [
        "Suco de laranja", "Suco de maçã", "Suco de uva", "Suco de maracujá",
        "Limonada", "Água de coco", "Chá verde", "Chá preto", "Chá de camomila",
        "Café", "Cappuccino", "Chocolate quente", "Vitamina", "Smoothie",
        "Refrigerante", "Água", "Energético", "Isotônico", "Vinho", "Cerveja"
    ]
    
    foods = []
    
    # Combina categorias para atingir 400
    foods.extend(base_fruits)
    foods.extend(vegetables)
    foods.extend(meats)
    foods.extend(dairy)
    foods.extend(grains)
    foods.extend(snacks)
    foods.extend(desserts)
    foods.extend(beverages)
    
    # Se ainda não atingiu 400, adiciona variações
    while len(foods) < count:
        suffix = random.choice(["Especial", "Premium", "Orgânico", "Natural", 
                               "Artesanal", "Caseiro", "Gourmet", "Rústico"])
        base = random.choice(foods[:20])  # Pega das frutas base
        foods.append(f"{base} {suffix}")
    
    return foods[:count]


def generate_boosts(count=300):
    """Gera lista de boosts."""
    speed_boosts = [f"Velocidade +{i}%" for i in range(10, 101, 10)]
    xp_boosts = [f"XP +{i}%" for i in [10, 20, 25, 30, 40, 50, 75, 100]]
    coin_boosts = [f"Moedas +{i}%" for i in [10, 20, 25, 30, 40, 50, 75, 100]]
    
    special_boosts = [
        "Super Salto", "Salto Duplo", "Salto Infinito",
        "Escudo", "Escudo Dourado", "Escudo Diamante",
        "Imunidade", "Imunidade Total", "Imunidade Temporária",
        "Regeneração", "Regeneração Rápida", "Regeneração Máxima",
        "Ataque Especial", "Ataque Poderoso", "Ataque Crítico",
        "Defesa Extra", "Defesa Máxima", "Defesa Absoluta",
        "Sorte", "Sorte Extra", "Sorte Máxima",
        "Resistência", "Resistência Extra", "Resistência Máxima",
        "Agilidade", "Agilidade Extra", "Agilidade Máxima",
        "Força", "Força Extra", "Força Máxima",
        "Inteligência", "Inteligência Extra", "Inteligência Máxima",
        "Carisma", "Carisma Extra", "Carisma Máxima"
    ]
    
    time_boosts = [
        "Duração +10s", "Duração +20s", "Duração +30s",
        "Duração +40s", "Duração +50s", "Duração +60s",
        "Duração +90s", "Duração +120s", "Duração +180s",
        "Duração +300s"
    ]
    
    size_boosts = [
        "Tamanho Pequeno", "Tamanho Normal", "Tamanho Grande",
        "Tamanho Gigante", "Tamanho Enorme", "Tamanho Colossal"
    ]
    
    ability_boosts = [
        "Voo Temporário", "Invisibilidade", "Teletransporte",
        "Parar o Tempo", "Congelar Inimigos", "Magnetismo",
        "Explosão de Energia", "Raio Laser", "Tornado",
        "Terremoto", "Tsunami", "Vulcão"
    ]
    
    boosts = []
    boosts.extend(speed_boosts)
    boosts.extend(xp_boosts)
    boosts.extend(coin_boosts)
    boosts.extend(special_boosts)
    boosts.extend(time_boosts)
    boosts.extend(size_boosts)
    boosts.extend(ability_boosts)
    
    # Se não atingiu 300, adiciona variações
    while len(boosts) < count:
        level = random.choice(["I", "II", "III", "IV", "V"])
        boost = random.choice(boosts[:50])
        boosts.append(f"{boost} Nível {level}")
    
    return boosts[:count]


def generate_clothes(count=200):
    """Gera lista de roupas."""
    colors = [
        "Branco", "Preto", "Azul", "Vermelho", "Verde", "Amarelo",
        "Roxo", "Rosa", "Laranja", "Cinza", "Marrom", "Bege",
        "Dourado", "Prateado", "Turquesa", "Coral", "Índigo",
        "Lavanda", "Salmão", "Menta"
    ]
    
    shirt_types = ["Camiseta", "Camisa", "Regata", "Blusa", "Moletom"]
    pants_types = ["Calça", "Bermuda", "Saia", "Legging", "Jeans"]
    shoes_types = ["Tênis", "Sapato", "Sandália", "Bota", "Chinelo"]
    dress_types = ["Vestido", "Macacão", "Jardineira", "Kimono"]
    hat_types = ["Boné", "Chapéu", "Boina", "Gorro", "Tiara"]
    accessory_types = ["Cachecol", "Luva", "Cinto", "Gravata", "Laço"]
    
    clothes = []
    
    # Gera combinações
    for color in colors[:10]:  # 10 cores principais
        for shirt in shirt_types:
            clothes.append(f"{shirt} {color}")
        
        for pants in pants_types:
            clothes.append(f"{pants} {color}")
        
        for shoe in shoes_types:
            clothes.append(f"{shoe} {color}")
    
    # Adiciona vestidos e outros
    for color in colors[:10]:
        for dress in dress_types:
            clothes.append(f"{dress} {color}")
    
    # Adiciona chapéus e acessórios
    for color in colors[:10]:
        for hat in hat_types:
            clothes.append(f"{hat} {color}")
        for acc in accessory_types:
            clothes.append(f"{acc} {color}")
    
    # Se não atingiu 200, adiciona variações
    while len(clothes) < count:
        style = random.choice(["Casual", "Esportivo", "Elegante", "Streetwear", "Vintage"])
        base = random.choice(clothes[:30])
        clothes.append(f"{base} {style}")
    
    return clothes[:count]


def generate_accessories(count=100):
    """Gera lista de acessórios."""
    glasses = [
        "Óculos Escuros", "Óculos Redondos", "Óculos Quadrados",
        "Óculos de Aviador", "Óculos de Sol", "Óculos Graduados",
        "Óculos de Leitura", "Óculos de Natação", "Óculos de Esqui",
        "Óculos de Proteção"
    ]
    
    hats = [
        "Chapéu Preto", "Chapéu Branco", "Chapéu Azul",
        "Chapéu Vermelho", "Chapéu de Palha", "Chapéu Fedora",
        "Chapéu Cowboy", "Chapéu de Pirata", "Chapéu de Mago",
        "Chapéu de Cozinheiro"
    ]
    
    caps = [
        "Boné Preto", "Boné Branco", "Boné Azul",
        "Boné Vermelho", "Boné Verde", "Boné Amarelo",
        "Boné Roxo", "Boné Rosa", "Boné Laranja",
        "Boné Cinza"
    ]
    
    jewelry = [
        "Colar de Ouro", "Colar de Prata", "Colar de Pérolas",
        "Pulseira de Ouro", "Pulseira de Prata", "Pulseira de Diamante",
        "Anel de Ouro", "Anel de Prata", "Anel de Diamante",
        "Brinco de Ouro", "Brinco de Prata", "Brinco de Pérola",
        "Pingente de Ouro", "Pingente de Prata", "Pingente de Diamante",
        "Corrente de Ouro", "Corrente de Prata", "Corrente de Diamante",
        "Tornozeleira", "Aliança"
    ]
    
    bags = [
        "Mochila Escolar", "Mochila de Viagem", "Mochila Esportiva",
        "Bolsa de Mão", "Bolsa de Ombro", "Bolsa Tote",
        "Pochete", "Necessaire", "Estojo", "Mala"
    ]
    
    tech = [
        "Relógio Digital", "Relógio Analógico", "Relógio Inteligente",
        "Fone de Ouvido", "Headset", "Óculos VR",
        "Câmera", "Drone Mini", "Tablet", "Celular"
    ]
    
    pets_accessories = [
        "Coleira", "Guia", "Bandana Pet",
        "Roupinha Pet", "Brinquedo Pet", "Comedouro",
        "Bebedouro", "Caminha Pet", "Transportadora", "Escova Pet"
    ]
    
    accessories = []
    accessories.extend(glasses)
    accessories.extend(hats)
    accessories.extend(caps)
    accessories.extend(jewelry)
    accessories.extend(bags)
    accessories.extend(tech)
    accessories.extend(pets_accessories)
    
    # Se não atingiu 100, adiciona variações
    while len(accessories) < count:
        material = random.choice(["de Ouro", "de Prata", "de Diamante", "de Pérola", "Premium"])
        base = random.choice(accessories[:30])
        accessories.append(f"{base} {material}")
    
    return accessories[:count]


def generate_markdown():
    """Gera o arquivo markdown com todos os 1000 itens."""
    foods = generate_foods(400)
    boosts = generate_boosts(300)
    clothes = generate_clothes(200)
    accessories = generate_accessories(100)
    
    md_content = """# CapyZen - 1000 Itens Completos

## Resumo

* **Comidas:** 400 itens
* **Boosts:** 300 itens
* **Roupas:** 200 itens
* **Acessórios:** 100 itens

---

# Comidas (400)

"""
    
    for i, food in enumerate(foods, 1):
        md_content += f"{i}. {food}\n"
    
    md_content += "\n---\n\n# Boosts (300)\n\n"
    
    for i, boost in enumerate(boosts, 1):
        md_content += f"{i}. {boost}\n"
    
    md_content += "\n---\n\n# Roupas (200)\n\n"
    
    for i, cloth in enumerate(clothes, 1):
        md_content += f"{i}. {cloth}\n"
    
    md_content += "\n---\n\n# Acessórios (100)\n\n"
    
    for i, accessory in enumerate(accessories, 1):
        md_content += f"{i}. {accessory}\n"
    
    md_content += "\n---\n\n**Total: 1000 itens**\n"
    
    return md_content


if __name__ == "__main__":
    content = generate_markdown()
    
    # Salva o arquivo
    output_path = "/home/matteo.zanona/Documentos/capygame/CapyZen_1000_Itens.md"
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Arquivo gerado com sucesso: {output_path}")
    print(f"   - Comidas: 400 itens")
    print(f"   - Boosts: 300 itens")
    print(f"   - Roupas: 200 itens")
    print(f"   - Acessórios: 100 itens")
    print(f"   - Total: 1000 itens")
