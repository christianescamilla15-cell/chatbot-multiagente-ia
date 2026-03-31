"""Seed 500 residents + payments + tickets + messages + knowledge base."""
import os
import random
import asyncio
import asyncpg
from datetime import datetime, timedelta, date

# Mexican first/last names for realistic data
FIRST_NAMES = [
    "José", "María", "Juan", "Ana", "Carlos", "Laura", "Miguel", "Sofía", "Luis", "Gabriela",
    "Fernando", "Patricia", "Ricardo", "Diana", "Alejandro", "Mónica", "Roberto", "Carmen", "Daniel", "Rosa",
    "Jorge", "Elena", "Francisco", "Lucía", "Pedro", "Isabel", "Andrés", "Verónica", "Eduardo", "Adriana",
    "Sergio", "Teresa", "Raúl", "Martha", "Enrique", "Claudia", "Óscar", "Silvia", "Alberto", "Sandra",
    "Héctor", "Leticia", "Manuel", "Gloria", "David", "Cristina", "Arturo", "Norma", "Javier", "Alicia",
    "Gustavo", "Beatriz", "Rafael", "Marisol", "Víctor", "Fernanda", "Ernesto", "Valeria", "César", "Paulina",
]

LAST_NAMES = [
    "García", "Hernández", "López", "Martínez", "González", "Rodríguez", "Pérez", "Sánchez", "Ramírez", "Cruz",
    "Flores", "Morales", "Reyes", "Jiménez", "Torres", "Domínguez", "Gutiérrez", "Díaz", "Mendoza", "Vargas",
    "Castro", "Ortiz", "Romero", "Rubio", "Medina", "Aguilar", "Herrera", "Guerrero", "Vega", "Ramos",
    "Delgado", "Ríos", "Navarro", "Cervantes", "Salazar", "Campos", "Cortés", "Contreras", "Sandoval", "Ibarra",
]

STREETS = [
    "Calle Jacarandas", "Av. Los Pinos", "Calle Bugambilias", "Av. Central", "Calle Roble",
    "Av. Las Palmas", "Calle Fresno", "Calle Cedro", "Av. del Parque", "Calle Sauce",
    "Calle Magnolia", "Av. Principal", "Calle Tulipán", "Calle Girasol", "Av. Orquídea",
]

BUILDINGS = ["A", "B", "C", "D", "E", "F", "G", "H"]
BLOCKS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]

TICKET_SUBJECTS = {
    "maintenance": [
        "Fuga de agua en baño", "Elevador fuera de servicio", "Luz fundida en pasillo",
        "Puerta de garage no abre", "Filtración en techo", "Pintura dañada en fachada",
        "Tubería tapada en cocina", "Alarma contra incendios no funciona",
        "Vidrio roto en área común", "Calentador no enciende",
    ],
    "technical_support": [
        "Internet lento", "Sin señal de WiFi", "Cámara de seguridad no graba",
        "Interfón no funciona", "App de acceso no conecta", "Control de acceso bloqueado",
        "Red caída en edificio B", "Problemas con medidor eléctrico",
    ],
    "billing": [
        "Consulta de saldo pendiente", "Solicitud de recibo de pago", "Cargo no reconocido",
        "Descuento por pronto pago", "Aclaración de adeudo", "Solicitud de estado de cuenta",
    ],
    "general": [
        "Horario de alberca", "Reglamento de mascotas", "Reservación de salón de fiestas",
        "Horario de gimnasio", "Información de mudanzas", "Contacto de administración",
    ],
    "escalation": [
        "Problema no resuelto desde hace 2 semanas", "Queja formal por ruido",
        "Solicitud de hablar con administrador", "Inconformidad con cobro",
    ],
}

KNOWLEDGE_DOCS = [
    ("Reglamento General del Condominio", "rules", """
REGLAMENTO GENERAL — Residencial Las Palmas

1. HORARIOS DE SILENCIO: Lunes a Viernes 22:00-07:00, Fines de semana 23:00-08:00.
2. MASCOTAS: Se permiten hasta 2 mascotas por unidad. Deben usar correa en áreas comunes. Los dueños son responsables de recoger desechos.
3. ESTACIONAMIENTO: Máximo 2 vehículos por unidad. Visitantes usan estacionamiento designado con gafete temporal.
4. MUDANZAS: Solo de Lunes a Sábado, 08:00-18:00. Notificar a administración con 48 horas de anticipación.
5. ÁREAS COMUNES: Reservar con mínimo 72 horas. Depósito de $2,000 MXN. Máximo 50 personas.
6. MODIFICACIONES: Cualquier remodelación requiere autorización escrita de la administración.
7. BASURA: Depositar en contenedores designados. Separar reciclables. Horario de recolección: Lun/Mié/Vie 07:00.
"""),
    ("Horarios de Amenidades", "schedule", """
HORARIOS — Residencial Las Palmas

ALBERCA: Lun-Dom 07:00-21:00 (Mantenimiento: Martes 06:00-09:00)
GIMNASIO: Lun-Sáb 06:00-22:00, Dom 07:00-20:00
SALÓN DE FIESTAS: Reservar con 72h. Máx 50 personas. $2,000 depósito.
ÁREA DE JUEGOS: 08:00-20:00. Niños menores de 10 con adulto.
ROOF GARDEN: 10:00-22:00. No música después de 21:00.
ESTACIONAMIENTO VISITAS: 07:00-23:00. Registro en caseta.
ADMINISTRACIÓN: Lun-Vie 09:00-18:00, Sáb 09:00-13:00.
SEGURIDAD/CASETA: 24/7.
"""),
    ("Política de Pagos y Cuotas", "payment_policy", """
POLÍTICA DE PAGOS — Residencial Las Palmas

CUOTA MENSUAL DE MANTENIMIENTO: $3,500.00 MXN
FECHA LÍMITE: Día 10 de cada mes.
DESCUENTO PRONTO PAGO: 5% si se paga antes del día 5.
RECARGO POR MORA: 3% mensual sobre saldo vencido.
FORMAS DE PAGO: Transferencia bancaria, domiciliación, efectivo en administración.
CUENTA BANCARIA: BBVA — CLABE: 012180001234567890
REFERENCIA: Número de unidad + mes (ej: A101-ABR2026)
RECIBOS: Disponibles en administración o por WhatsApp con verificación.
ADEUDOS: 3+ meses sin pago → suspensión de amenidades. 6+ meses → acción legal.
"""),
    ("Procedimientos de Mantenimiento", "maintenance", """
PROCEDIMIENTOS DE MANTENIMIENTO — Residencial Las Palmas

REPORTAR FALLA:
1. Enviar mensaje por WhatsApp al sistema de soporte
2. Describir el problema con foto si es posible
3. El sistema genera un ticket automáticamente
4. Tiempo de respuesta: Urgente 2h, Alta 4h, Media 24h, Baja 72h

MANTENIMIENTO PREVENTIVO:
- Elevadores: Revisión mensual (primer lunes)
- Alberca: Limpieza martes 06:00-09:00
- Jardines: Podado semanal (miércoles)
- Cisternas: Limpieza trimestral
- Impermeabilización: Revisión anual (mayo)

EMERGENCIAS 24/7: Llamar a caseta de seguridad.
PLOMERÍA DE EMERGENCIA: Se atiende en máximo 2 horas.
ELECTRICIDAD: Cortes programados se notifican con 48h de anticipación.
"""),
    ("Preguntas Frecuentes", "faq", """
FAQ — Residencial Las Palmas

P: ¿Cómo pago mi mantenimiento?
R: Transferencia a BBVA CLABE 012180001234567890. Referencia: tu unidad + mes.

P: ¿Puedo tener mascotas?
R: Sí, máximo 2. Deben usar correa en áreas comunes.

P: ¿Cómo reservo el salón de fiestas?
R: Contacta administración con 72h de anticipación. Depósito $2,000.

P: ¿Cuál es el horario de la alberca?
R: Lunes a Domingo 07:00-21:00. Mantenimiento martes 06:00-09:00.

P: ¿Dónde reporto una fuga?
R: Por WhatsApp al sistema de soporte. Si es emergencia, llama a caseta 24/7.

P: ¿Puedo hacer remodelaciones?
R: Sí, con autorización escrita de administración. Solo Lun-Sáb 08:00-18:00.

P: ¿Cómo solicito mi estado de cuenta?
R: Por WhatsApp con verificación de identidad (código OTP).

P: ¿Qué pasa si no pago mantenimiento?
R: Recargo del 3% mensual. 3+ meses: suspensión amenidades. 6+ meses: acción legal.
"""),
]


async def seed_all(database_url: str):
    """Run full seed process."""
    pool = await asyncpg.create_pool(database_url, min_size=2, max_size=5)

    async with pool.acquire() as conn:
        # Check if already seeded
        count = await conn.fetchval("SELECT COUNT(*) FROM residents")
        if count > 0:
            print(f"Already seeded: {count} residents. Use --force to reseed.")
            await pool.close()
            return

    print("Seeding 500 residents...")
    await seed_residents(pool)
    print("Seeding payments...")
    await seed_payments(pool)
    print("Seeding tickets...")
    await seed_tickets(pool)
    print("Seeding messages...")
    await seed_messages(pool)
    print("Seeding knowledge base...")
    await seed_knowledge(pool)
    print("Seeding verification scenarios...")
    await seed_verification_scenarios(pool)

    # Print summary
    async with pool.acquire() as conn:
        for table in ["residents", "payments", "tickets", "messages", "knowledge_documents", "verification_codes"]:
            count = await conn.fetchval(f"SELECT COUNT(*) FROM {table}")
            print(f"  {table}: {count} rows")

    print("\nSeed complete!")
    await pool.close()


async def seed_residents(pool):
    """Create 500 synthetic residents."""
    used_phones = set()
    used_units = set()

    async with pool.acquire() as conn:
        for i in range(500):
            first = random.choice(FIRST_NAMES)
            last1 = random.choice(LAST_NAMES)
            last2 = random.choice(LAST_NAMES)
            full_name = f"{first} {last1} {last2}"

            # Generate unique phone
            while True:
                phone = f"+5215{random.randint(500000000, 599999999)}"
                if phone not in used_phones:
                    used_phones.add(phone)
                    break

            # Generate unique unit
            building = BUILDINGS[i // 65] if i < len(BUILDINGS) * 65 else random.choice(BUILDINGS)
            floor = (i % 65) // 13 + 1
            unit_in_floor = (i % 13) + 1
            unit_number = f"{building}{floor}{unit_in_floor:02d}"
            if unit_number in used_units:
                unit_number = f"{building}{floor}{i:03d}"
            used_units.add(unit_number)

            street = random.choice(STREETS)
            block = random.choice(BLOCKS)
            email = f"{first.lower().replace('é','e').replace('á','a').replace('í','i').replace('ó','o').replace('ú','u')}.{last1.lower().replace('é','e').replace('á','a').replace('í','i').replace('ó','o').replace('ú','u')}@gmail.com" if random.random() > 0.3 else None
            status = random.choices(["active", "inactive", "suspended"], weights=[85, 10, 5])[0]

            await conn.execute("""
                INSERT INTO residents (full_name, phone, email, unit_number, building, street, block, location, resident_status, verification_enabled)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            """, full_name, phone, email, unit_number, building, street, block,
                f"Residencial Las Palmas, Manzana {block}, {street}", status, True)

    # Set Christian's phone as resident #1 for testing
    async with pool.acquire() as conn:
        await conn.execute("""
            UPDATE residents SET phone = '+5215579605324', full_name = 'Christian Hernandez Escamilla',
            email = 'christianescamilla15@gmail.com', unit_number = 'A101', building = 'A',
            resident_status = 'active' WHERE id = 1
        """)


async def seed_payments(pool):
    """Seed payment records for all residents."""
    async with pool.acquire() as conn:
        residents = await conn.fetch("SELECT id FROM residents")

        for r in residents:
            rid = r["id"]
            # Monthly maintenance for last 6 months
            for month_offset in range(6):
                dt = date.today().replace(day=1) - timedelta(days=30 * month_offset)
                due = dt.replace(day=10)

                roll = random.random()
                if roll < 0.6:  # 60% paid
                    status, balance, paid_amount = "paid", 0, 3500.00
                    last_pay = due - timedelta(days=random.randint(0, 8))
                elif roll < 0.8:  # 20% partial
                    paid_amount = random.choice([1000, 1500, 2000, 2500])
                    balance = 3500 - paid_amount
                    status, last_pay = "partial", due + timedelta(days=random.randint(1, 15))
                elif roll < 0.95:  # 15% pending (current month)
                    status, balance, paid_amount, last_pay = "pending", 3500.00, 0, None
                else:  # 5% overdue
                    status, balance, paid_amount, last_pay = "overdue", 3500.00, 0, None

                receipt = f"REC-{rid:04d}-{dt.strftime('%Y%m')}" if status == "paid" else None

                await conn.execute("""
                    INSERT INTO payments (resident_id, concept, amount, current_balance, due_date, payment_status, receipt_ref, last_payment_date, last_payment_amount)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                """, rid, f"Mantenimiento {dt.strftime('%B %Y')}", 3500.00, balance, due,
                    status, receipt, last_pay, paid_amount if paid_amount > 0 else None)


async def seed_tickets(pool):
    """Create ~200 tickets across categories."""
    async with pool.acquire() as conn:
        residents = await conn.fetch("SELECT id FROM residents ORDER BY RANDOM() LIMIT 150")
        ticket_num = 1

        for r in residents:
            rid = r["id"]
            num_tickets = random.randint(1, 3)

            for _ in range(num_tickets):
                if ticket_num > 200:
                    break
                category = random.choice(list(TICKET_SUBJECTS.keys()))
                subject = random.choice(TICKET_SUBJECTS[category])
                priority = random.choices(["low", "medium", "high", "urgent"], weights=[20, 45, 25, 10])[0]
                status = random.choices(["open", "in_progress", "pending", "resolved", "escalated", "closed"],
                                        weights=[15, 10, 10, 35, 5, 25])[0]

                agent_map = {
                    "technical_support": "NovaAgent", "maintenance": "AtlasAgent",
                    "billing": "AriaAgent", "general": "OrionAgent", "escalation": "NexusAgent"
                }

                created = datetime.now() - timedelta(days=random.randint(1, 90))
                resolved = created + timedelta(hours=random.randint(1, 72)) if status in ("resolved", "closed") else None
                resolution = f"Problema resuelto: {subject.lower()}" if resolved else None

                await conn.execute("""
                    INSERT INTO tickets (ticket_ref, resident_id, category, priority, status, subject, description, assigned_agent, resolution, created_at, updated_at, resolved_at)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                """, f"TKT-{ticket_num:04d}", rid, category, priority, status, subject,
                    f"Residente reporta: {subject}", agent_map.get(category, "OrionAgent"),
                    resolution, created, resolved or created, resolved)

                ticket_num += 1


async def seed_messages(pool):
    """Seed sample conversation messages."""
    async with pool.acquire() as conn:
        residents = await conn.fetch("SELECT id FROM residents ORDER BY RANDOM() LIMIT 50")

        conversations = [
            [
                ("inbound", "Hola, quiero saber mi saldo pendiente"),
                ("outbound", "¡Hola! Para consultar tu saldo necesito verificar tu identidad. Te enviaré un código por WhatsApp."),
                ("outbound", "Tu código de verificación es: 847291"),
                ("inbound", "847291"),
                ("outbound", "Verificación exitosa. Tu saldo pendiente es: $3,500.00 MXN. Fecha límite: 10 de abril 2026."),
            ],
            [
                ("inbound", "Hay una fuga de agua en el baño de mi departamento"),
                ("outbound", "Lamento escuchar eso. Voy a crear un ticket de mantenimiento urgente. ¿Puedes describir la ubicación exacta de la fuga?"),
                ("inbound", "Es debajo del lavabo, está goteando bastante"),
                ("outbound", "Ticket creado: TKT-0001. Prioridad: Alta. Un técnico te contactará en las próximas 2 horas."),
            ],
            [
                ("inbound", "¿Cuál es el horario de la alberca?"),
                ("outbound", "La alberca está abierta de Lunes a Domingo de 07:00 a 21:00. Los martes hay mantenimiento de 06:00 a 09:00."),
            ],
        ]

        for r in residents:
            convo = random.choice(conversations)
            base_time = datetime.now() - timedelta(days=random.randint(1, 30))

            for i, (direction, content) in enumerate(convo):
                await conn.execute("""
                    INSERT INTO messages (resident_id, direction, channel, agent, content, created_at)
                    VALUES ($1, $2, $3, $4, $5, $6)
                """, r["id"], direction, "whatsapp",
                    "OrionAgent" if direction == "outbound" else None,
                    content, base_time + timedelta(minutes=i * 2))


async def seed_knowledge(pool):
    """Seed knowledge base documents."""
    async with pool.acquire() as conn:
        for title, category, content in KNOWLEDGE_DOCS:
            await conn.execute("""
                INSERT INTO knowledge_documents (title, category, content, tags)
                VALUES ($1, $2, $3, $4)
            """, title, category, content.strip(), category)


async def seed_verification_scenarios(pool):
    """Seed OTP verification test data."""
    async with pool.acquire() as conn:
        # Get first resident (Christian) for test scenarios
        resident = await conn.fetchrow("SELECT id FROM residents WHERE id = 1")
        if not resident:
            return

        rid = resident["id"]

        # Valid OTP (recent, unused)
        await conn.execute("""
            INSERT INTO verification_codes (resident_id, code, phone, status, attempts, expires_at)
            VALUES ($1, '123456', '+5215579605324', 'pending', 0, NOW() + INTERVAL '5 minutes')
        """, rid)

        # Expired OTP
        await conn.execute("""
            INSERT INTO verification_codes (resident_id, code, phone, status, attempts, expires_at)
            VALUES ($1, '654321', '+5215579605324', 'expired', 0, NOW() - INTERVAL '10 minutes')
        """, rid)

        # Failed OTP (max attempts)
        await conn.execute("""
            INSERT INTO verification_codes (resident_id, code, phone, status, attempts, max_attempts, expires_at)
            VALUES ($1, '111111', '+5215579605324', 'failed', 3, 3, NOW() + INTERVAL '5 minutes')
        """, rid)


async def reseed(database_url: str):
    """Drop all data and reseed."""
    pool = await asyncpg.create_pool(database_url, min_size=2, max_size=5)
    async with pool.acquire() as conn:
        for table in ["agent_runs", "ticket_events", "messages", "verification_codes", "tickets", "payments", "resident_sessions", "residents", "knowledge_documents"]:
            await conn.execute(f"TRUNCATE {table} CASCADE")
        print("All tables truncated.")
    await pool.close()

    await seed_all(database_url)


if __name__ == "__main__":
    import sys
    db_url = os.environ.get("DATABASE_URL", "")
    if not db_url:
        print("Set DATABASE_URL environment variable")
        sys.exit(1)

    if "--force" in sys.argv:
        asyncio.run(reseed(db_url))
    else:
        asyncio.run(seed_all(db_url))
