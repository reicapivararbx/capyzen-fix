#!/usr/bin/env python3
"""
Gerador de 1000 itens para o jogo CapyZen — saída em JSON.
Categorias: Comida (400), Boost (300), Roupa (200), Acessório (100)
"""

import json
import os
import random

# ── Emojis por categoria ────────────────────────────────────────────────

FOOD_EMOJIS = [
    "🍎", "🍌", "🍑", "🍓", "🍇", "🍊", "🍍", "🥭", "🍐", "🥝",
    "🍋", "🥥", "🫐", "🍈", "🍉", "🥑", "🥦", "🥕", "🌽", "🍅",
    "🧅", "🥔", "🥬", "🥒", "🌶️", "🍆", "🥜", "🍞", "🥐", "🧀",
    "🍖", "🍗", "🥩", "🥓", "🍔", "🌭", "🍕", "🌮", "🌯", "🥗",
    "🍿", "🍩", "🍪", "🎂", "🍰", "🧁", "🍫", "🍬", "🍭", "☕",
    "🍵", "🥤", "🧃", "🥛", "🍶", "🍺", "🍷", "🥂", "🍹", "🧊",
]

BOOST_EMOJIS = [
    "⚡", "⭐", "🛡️", "💪", "🎯", "🔥", "💎", "✨", "🚀", "⏰",
    "🌟", "💫", "🎖️", "🏆", "👑", "🔮", "🧲", "⚔️", "🗡️", "🏹",
    "🪄", "🎭", "🃏", "🎪", "🌀", "💥", "💢", "🔆", "✴️", "🔱",
]

CLOTHES_EMOJIS = [
    "👕", "👗", "👖", "👟", "🧢", "🧣", "🧤", "🎩", "👔", "🩳",
    "👙", "👘", "🥿", "👠", "👢", "🩴", "🧦", "🪖", "🎽", "🧥",
]

ACCESSORY_EMOJIS = [
    "👓", "🎒", "💍", "📿", "⌚", "🎧", "📱", "💎", "🕶️", "👜",
    "💼", "🪙", "🏅", "🎖️", "🪬", "🧿", "🔑", "🗝️", "🧸", "🎀",
]

# ── Geração de comidas ──────────────────────────────────────────────────

def generate_foods(count=400):
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
    foods.extend(base_fruits)
    foods.extend(vegetables)
    foods.extend(meats)
    foods.extend(dairy)
    foods.extend(grains)
    foods.extend(snacks)
    foods.extend(desserts)
    foods.extend(beverages)

    while len(foods) < count:
        suffix = random.choice(["Especial", "Premium", "Orgânico", "Natural",
                                "Artesanal", "Caseiro", "Gourmet", "Rústico"])
        base = random.choice(foods[:20])
        foods.append(f"{base} {suffix}")

    return foods[:count]


def generate_boosts(count=300):
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

    while len(boosts) < count:
        level = random.choice(["I", "II", "III", "IV", "V"])
        boost = random.choice(boosts[:50])
        boosts.append(f"{boost} Nível {level}")

    return boosts[:count]


def generate_clothes(count=200):
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
    acc_types = ["Cachecol", "Luva", "Cinto", "Gravata", "Laço"]

    clothes = []
    for color in colors[:10]:
        for s in shirt_types:
            clothes.append(f"{s} {color}")
        for p in pants_types:
            clothes.append(f"{p} {color}")
        for sh in shoes_types:
            clothes.append(f"{sh} {color}")
    for color in colors[:10]:
        for d in dress_types:
            clothes.append(f"{d} {color}")
    for color in colors[:10]:
        for h in hat_types:
            clothes.append(f"{h} {color}")
        for a in acc_types:
            clothes.append(f"{a} {color}")

    while len(clothes) < count:
        style = random.choice(["Casual", "Esportivo", "Elegante", "Streetwear", "Vintage"])
        base = random.choice(clothes[:30])
        clothes.append(f"{base} {style}")

    return clothes[:count]


def generate_accessories(count=100):
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
    pets = [
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
    accessories.extend(pets)

    while len(accessories) < count:
        material = random.choice(["de Ouro", "de Prata", "de Diamante", "de Pérola", "Premium"])
        base = random.choice(accessories[:30])
        accessories.append(f"{base} {material}")

    return accessories[:count]


# ── Descrições em português ─────────────────────────────────────────────

FOOD_DESCRIPTIONS = [
    "Alimento delicioso que a capivara adora!",
    "Comida fresca e saborosa para energizar.",
    "Um petisco natural cheio de vitaminas.",
    "Sabor inconfundível que dá energia extra.",
    "Ingrediente premium para receitas incríveis.",
    "Fruta madura e suculenta — irresistível!",
    "Comida caseira feita com carinho.",
    "Petisco saudável para qualquer hora do dia.",
    "Sabor tropical refrescante e energético.",
    "Comida orgânica direto da natureza.",
]

BOOST_DESCRIPTIONS = [
    "Potencialize suas habilidades por tempo limitado!",
    "Dá um boost poderoso na sua jornada.",
    "Ativa poderes especiais para a capivara.",
    "Aumenta atributos por alguns minutos.",
    "Melhoria temporária de desempenho.",
    "Efeito poderoso que muda o jogo!",
    "Bônus exclusivo para capivaras corajosas.",
    "Upgrade instantâneo de habilidades.",
    "Energia concentrada em um item só!",
    "Buff raro com efeito devastador.",
]

CLOTHES_DESCRIPTIONS = [
    "Roupa estilosa para a capivara arrasar!",
    "Look completo para qualquer ocasião.",
    "Moda capivara de alta qualidade.",
    "Vestuário confortável e fashion.",
    "Outfit que combina com aventuras!",
    "Roupa exclusiva da coleção CapyZen.",
    "Estilo único para se destacar.",
    "Peça de roupa rara e elegante.",
    "Conforto e estilo em um só item!",
    "Look premium para capivaras descoladas.",
]

ACCESSORY_DESCRIPTIONS = [
    "Acessório indispensável para a capivara!",
    "Complemento perfeito para qualquer look.",
    "Item raro que poucos capivaras possuem.",
    "Acessório elegante de alta qualidade.",
    "Peça exclusiva da coleção especial.",
    "Complemento estiloso para aventuras.",
    "Acessório funcional e bonito.",
    "Item premium com visual incrível.",
    "Acessório que faz toda a diferença!",
    "Complemento raro e cobiçado.",
]


def emoji_for_food(name: str) -> str:
    """Retorna emoji baseado no nome da comida."""
    lower = name.lower()
    mapping = {
        "maçã": "🍎", "banana": "🍌", "pêssego": "🍑", "morango": "🍓",
        "uva": "🍇", "laranja": "🍊", "abacaxi": "🍍", "manga": "🥭",
        "pera": "🍐", "kiwi": "🥝", "limão": "🍋", "coco": "🥥",
        "melancia": "🍉", "framboesa": "🫐", "melão": "🍈",
        "cenoura": "🥕", "brócolis": "🥦", "tomate": "🍅", "batata": "🥔",
        "cebola": "🧅", "milho": "🌽", "pimentão": "🌶️", "berinjela": "🍆",
        "alface": "🥬", "pepino": "🥒", "frango": "🍗", "carne": "🥩",
        "peixe": "🐟", "porco": "🥓", "salmão": "🐟", "atum": "🐟",
        "camarão": "🦐", "lagosta": "🦞", "caranguejo": "🦀", "polvo": "🐙",
        "leite": "🥛", "queijo": "🧀", "iogurte": "🥛", "manteiga": "🧈",
        "arroz": "🍚", "feijão": "🫘", "trigo": "🌾", "aveia": "🥣",
        "pipoca": "🍿", "batata frita": "🍟", "cookie": "🍪", "biscoito": "🍪",
        "pão de queijo": "🍞", "coxinha": "🥟", "pastel": "🥟", "esfiha": "🥙",
        "bolo": "🎂", "torta": "🥧", "sorvete": "🍦", "pudim": "🍮",
        "brigadeiro": "🍫", "chocolate": "🍫", "brownie": "🍫", "churros": "🍩",
        "waffle": "🧇", "panqueca": "🥞", "café": "☕", "cappuccino": "☕",
        "chá": "🍵", "suco": "🧃", "limonada": "🍋", "água de coco": "🥥",
        "vinho": "🍷", "cerveja": "🍺", "refrigerante": "🥤", "smoothie": "🥤",
        "energético": "⚡", "hamburger": "🍔", "pizza": "🍕", "taco": "🌮",
        "nachos": "🌮", "pretzel": "🥨", "amendoim": "🥜", "castanha": "🌰",
        "noz": "🌰", "pistache": "🥜", "amêndoa": "🥜", "waffle": "🧇",
        "crepe": "🥞", "gelatina": "🍮", "cheesecake": "🎂", "tiramisu": "🍰",
        "mousse": "🍫", "canudinho": "🥐", "beijinho": "🍬", "paçoca": "🍬",
        "espinafre": "🥬", "couve": "🥬", "repolho": "🥬", "beterraba": "🫒",
        "rabanete": "🫒", "ervilha": "🟢", "vagem": "🫛", "cogumelo": "🍄",
        "aspargo": "🌿", "inhame": "🥔", "batata-doce": "🍠", "mandioca": "🥔",
        "gengibre": "🫚", "suco de uva": "🍷", "suco de maçã": "🧃",
        "suco de maracujá": "🧃", "água": "💧", "isotônico": "💧",
        "cordeiro": "🥩", "peru": "🦃", "pato": "🦆", "coelho": "🐇",
        "ricota": "🧀", "mozzarella": "🧀", "cheddar": "🧀", "parmesão": "🧀",
    }
    for key, emoji in mapping.items():
        if key in lower:
            return emoji
    return random.choice(FOOD_EMOJIS)


def emoji_for_boost(name: str) -> str:
    lower = name.lower()
    if "velocidade" in lower:
        return "🚀"
    if "xp" in lower:
        return "⭐"
    if "moeda" in lower:
        return "🪙"
    if "salto" in lower:
        return "🦘"
    if "escudo" in lower:
        return "🛡️"
    if "imunidade" in lower:
        return "🛡️"
    if "regeneração" in lower:
        return "💚"
    if "ataque" in lower:
        return "⚔️"
    if "defesa" in lower:
        return "🛡️"
    if "sorte" in lower:
        return "🍀"
    if "resistência" in lower:
        return "🪨"
    if "agilidade" in lower:
        return "💨"
    if "força" in lower:
        return "💪"
    if "inteligência" in lower:
        return "🧠"
    if "carisma" in lower:
        return "✨"
    if "duração" in lower:
        return "⏰"
    if "tamanho" in lower:
        return "📏"
    if "voo" in lower:
        return "🕊️"
    if "invisibilidade" in lower:
        return "👻"
    if "teletransporte" in lower:
        return "🌀"
    if "tempo" in lower:
        return "⏳"
    if "congelar" in lower:
        return "❄️"
    if "magnetismo" in lower:
        return "🧲"
    if "energia" in lower:
        return "⚡"
    if "laser" in lower:
        return "🔫"
    if "tornado" in lower:
        return "🌪️"
    if "terremoto" in lower:
        return "🌋"
    if "tsunami" in lower:
        return "🌊"
    if "vulcão" in lower:
        return "🌋"
    return random.choice(BOOST_EMOJIS)


def emoji_for_clothes(name: str) -> str:
    lower = name.lower()
    if any(w in lower for w in ["camiseta", "camisa", "regata", "blusa", "moletom"]):
        return "👕"
    if any(w in lower for w in ["calça", "bermuda", "jeans"]):
        return "👖"
    if "saia" in lower:
        return "👗"
    if "legging" in lower:
        return "👖"
    if any(w in lower for w in ["vestido", "macacão", "jardineira", "kimono"]):
        return "👗"
    if any(w in lower for w in ["tênis", "sapato", "bota", "chinelo"]):
        return "👟"
    if "sandália" in lower:
        return "🩴"
    if any(w in lower for w in ["boné", "chapéu", "boina", "gorro", "tiara"]):
        return "🧢"
    if "cachecol" in lower:
        return "🧣"
    if "luva" in lower:
        return "🧤"
    if any(w in lower for w in ["cinto", "gravata", "laço"]):
        return "👔"
    return random.choice(CLOTHES_EMOJIS)


def emoji_for_accessory(name: str) -> str:
    lower = name.lower()
    if "óculos" in lower:
        return "👓"
    if any(w in lower for w in ["chapéu", "boné"]):
        return "🎩"
    if any(w in lower for w in ["colar", "pulseira", "anel", "brinco", "pingente",
                                  "corrente", "tornozeleira", "aliança"]):
        return "💍"
    if any(w in lower for w in ["mochila", "bolsa", "pochete", "necessaire", "estojo", "mala"]):
        return "🎒"
    if any(w in lower for w in ["relógio"]):
        return "⌚"
    if any(w in lower for w in ["fone", "headset"]):
        return "🎧"
    if "óculos vr" in lower:
        return "🥽"
    if any(w in lower for w in ["câmera", "drone"]):
        return "📷"
    if any(w in lower for w in ["tablet", "celular"]):
        return "📱"
    if any(w in lower for w in ["coleira", "guia", "bandana", "roupinha",
                                  "brinquedo", "comedouro", "bebedouro",
                                  "caminha", "transportadora", "escova"]):
        return "🐾"
    return random.choice(ACCESSORY_EMOJIS)


def pick_emoji(category: str, name: str) -> str:
    if category == "Comida":
        return emoji_for_food(name)
    if category == "Boost":
        return emoji_for_boost(name)
    if category == "Roupa":
        return emoji_for_clothes(name)
    return emoji_for_accessory(name)


def build_item(item_id: int, name: str, category: str) -> dict:
    """Constrói um item completo."""
    price_ranges = {
        "Comida":   (10, 500),
        "Boost":    (100, 2000),
        "Roupa":    (200, 3000),
        "Acessório": (500, 5000),
    }
    desc_lists = {
        "Comida":   FOOD_DESCRIPTIONS,
        "Boost":    BOOST_DESCRIPTIONS,
        "Roupa":    CLOTHES_DESCRIPTIONS,
        "Acessório": ACCESSORY_DESCRIPTIONS,
    }
    lo, hi = price_ranges[category]
    price = random.randint(lo, hi)
    # Round to nearest 5 for cleaner prices
    price = round(price / 5) * 5
    if price < lo:
        price = lo

    desc = random.choice(desc_lists[category])
    icon = pick_emoji(category, name)

    return {
        "id": item_id,
        "name": name,
        "icon": icon,
        "price": price,
        "description": desc,
        "category": category,
    }


def main():
    random.seed(42)  # Reprodutibilidade

    foods = generate_foods(400)
    boosts = generate_boosts(300)
    clothes = generate_clothes(200)
    accessories = generate_accessories(100)

    items = []
    item_id = 1

    for name in foods:
        items.append(build_item(item_id, name, "Comida"))
        item_id += 1

    for name in boosts:
        items.append(build_item(item_id, name, "Boost"))
        item_id += 1

    for name in clothes:
        items.append(build_item(item_id, name, "Roupa"))
        item_id += 1

    for name in accessories:
        items.append(build_item(item_id, name, "Acessório"))
        item_id += 1

    # Write JSON
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, "shared", "shop-items.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, indent=2)

    # Count by category
    counts = {}
    for item in items:
        counts[item["category"]] = counts.get(item["category"], 0) + 1

    print(f"✅ Gerado com sucesso: {output_path}")
    print(f"   Total: {len(items)} itens")
    for cat, cnt in counts.items():
        print(f"   - {cat}: {cnt}")


if __name__ == "__main__":
    main()
