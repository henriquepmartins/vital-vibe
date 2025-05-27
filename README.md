# Vital Vibe 🥗

> Conecte pacientes e nutricionistas em uma experiência multiplataforma, simplificando agendamentos e acompanhamentos nutricionais.

---

## 📚 Descrição
Vital Vibe é uma aplicação mobile que facilita a conexão entre pacientes e nutricionistas. Com agendamento de consultas, chatbot integrado com inteligência artificial, calendário integrado e notificações, torna o acompanhamento nutricional mais fluido e organizado. 🚀

---

## ⚙️ Tech Stack
- **Linguagem**: TypeScript  
- **Mobile**: Expo (React Native + React Native Web) com `expo-router`  
- **Navegação**: React Navigation (`@react-navigation/native`)  
- **UI**:  
  - RNEUI (`@rneui/themed`)  
  - Expo Vector Icons (`@expo/vector-icons`)  
  - React Native Calendars  
- **Backend & Auth**: Supabase (PostgreSQL, Auth, Triggers)  
- **Armazenamento Local**: Async Storage (`@react-native-async-storage/async-storage`)  
- **Testes**: Jest + `jest-expo`  
- **Outros**: Expo Updates, Splash Screen, Web Browser, Reanimated, etc.

---

## 🔍 Resumo do Projeto
1. **Cadastro e autenticação** de pacientes e nutricionistas (nome, email, CPF, avatar).  
2. **Agendamento de consultas** com tipo, data, horário e duração, além de lembretes configuráveis.  
3. **Conteúdo em Markdown** para dicas e orientações nutricionais.  
4. **Visualização em calendário** para facilitar o gerenciamento de compromissos.  
5. **Notificações push** para lembrar consultas e atualizações de status.  

Triggers no Supabase mantêm `auth.users` e `public.appointments` sempre sincronizados, garantindo consistência dos dados.

---

## ⚙️ Como rodar localmente

1. **Clone o repositório**  
   ```bash
   git clone https://github.com/henriquepmartins/vital-vibe.git
   cd vital-vibe

2. **Instale as dependências**  
   ```bun install```

3. **Configure o Supabase**  
   ```Importe o arquivo db_dump.sql no painel do seu projeto Supabase.```

4. **Adicione um arquivo .env no root do app**
```
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=your_supabase_url
```

6. **Execute o app**
```
   Mobile Android: bun run android
   Mobile iOS: bun run ios
   Web: bun run web
```
