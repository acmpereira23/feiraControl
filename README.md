# FeiraControl

Setup inicial do projeto FeiraControl, estruturado como monolito em camadas com backend Spring Boot, frontend React e infraestrutura local com PostgreSQL.

## Estrutura

- `backend/`: API Spring Boot com Java 21 e Maven
- `frontend/`: aplicação React com Vite, TypeScript e Tailwind CSS
- `docker-compose.yml`: banco PostgreSQL local

## Pré-requisitos

- Java 21
- Maven 3.9+
- Node.js 20+
- npm 10+
- Docker e Docker Compose

## Subir banco

Garanta antes que o Docker Desktop ou o daemon do Docker esteja em execução.

```bash
docker compose up -d postgres
```

Se o comando falhar com `Cannot connect to the Docker daemon`, o daemon pode estar desligado.
Se falhar com `permission denied while trying to connect to the docker API`, o daemon existe mas seu usuário não tem acesso ao socket do Docker.

## Corrigir Docker no WSL

Se `docker compose up -d postgres` falhar com `Cannot connect to the Docker daemon` ou `permission denied while trying to connect to the docker API`, valide o ambiente com:

```bash
bash scripts/check-docker-daemon.sh
```

### Opção 1: daemon local no WSL

Habilite `systemd` em `/etc/wsl.conf`:

```ini
[boot]
systemd=true

[network]
generateResolvConf=false
```

Ou rode o script auxiliar:

```bash
bash scripts/configure-wsl-docker.sh
```

Depois, no Windows:

```powershell
wsl --shutdown
```

Reabra a distro Ubuntu e rode:

```bash
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
docker version
docker compose up -d postgres
```

Se o erro persistir com `permission denied`, feche e reabra o terminal depois do `usermod`, confirme que o grupo `docker` existe com `getent group docker` e valide novamente com `docker version`.

### Opção 2: Docker Desktop com integração WSL

1. Instale ou abra o Docker Desktop no Windows.
2. Ative a integração da distro Ubuntu em `Settings > Resources > WSL Integration`.
3. No Windows, rode `wsl --shutdown`.
4. Reabra o WSL e valide:

```bash
docker version
docker compose up -d postgres
```

Se o socket `/var/run/docker.sock` existir mas o erro for `permission denied`, confira se a distro correta está integrada no Docker Desktop e reabra a sessão WSL após a integração.

Se quiser só iniciar o Docker Desktop e receber o checklist no Windows, rode:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-docker-desktop.ps1
```

## Rodar backend

```bash
cd backend
mvn spring-boot:run
```

Backend por padrão:

- `http://localhost:8080`
- health check: `http://localhost:8080/api/health`

## Rodar frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend por padrão:

- `http://localhost:5173`

## Alias para subir tudo

Se voce quer usar a plataforma no dia a dia com um comando unico, o projeto agora tem scripts para:

- subir `postgres`
- subir `backend`
- subir `frontend`
- parar tudo depois

Instalacao do alias no shell atual:

```bash
bash scripts/install-feiracontrol-alias.sh
source ~/.bashrc
```

Se voce usa `zsh`, pode instalar direto no arquivo certo:

```bash
bash scripts/install-feiracontrol-alias.sh ~/.zshrc
source ~/.zshrc
```

Uso:

```bash
feiracontrol
```

Parada:

```bash
feiracontrol-stop
```

Os scripts usam:

- [scripts/start-feiracontrol.sh](/mnt/c/Users/Augusto/Desktop/FeiraControl-Docs/scripts/start-feiracontrol.sh)
- [scripts/stop-feiracontrol.sh](/mnt/c/Users/Augusto/Desktop/FeiraControl-Docs/scripts/stop-feiracontrol.sh)
- [scripts/install-feiracontrol-alias.sh](/mnt/c/Users/Augusto/Desktop/FeiraControl-Docs/scripts/install-feiracontrol-alias.sh)

Observacoes:

- o alias espera que `frontend/node_modules` ja exista
- se ainda nao tiver instalado as dependencias do frontend, rode antes:

```bash
cd frontend
npm install
```

## Testes do frontend

Para executar a base automatizada de testes do frontend:

```bash
cd frontend
npm test
```

Para rodar em modo watch durante desenvolvimento:

```bash
cd frontend
npm run test:watch
```

## Testes E2E do frontend

A camada E2E usa Playwright com navegador real e sobe frontend + backend automaticamente durante a execucao.

Pre-requisito:

- Node.js e Java configurados no ambiente
- a suite usa o perfil `e2e` do backend com banco em memoria, entao nao depende do estado do seu Postgres local

Execucao:

```bash
cd frontend
npm run test:e2e
```

Para acompanhar visualmente no navegador:

```bash
cd frontend
npm run test:e2e:headed
```

Cobertura inicial:

- `register -> logout -> login -> sessao restaurada`
- `create cash movement -> list cash movements -> dashboard update`

Observacao:

- a suite gera emails unicos por execucao para evitar colisao com a base local
- os cenarios usam um periodo futuro para reduzir interferencia de dados operacionais ja existentes
- o backend sobe com perfil `e2e`, sem reutilizar o schema do banco local

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste se necessário.

Backend usa:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `BACKEND_PORT`

Frontend usa:

- `VITE_API_URL`

## Migracao Flyway em ambiente legado

Se o backend falhar com erro de `checksum mismatch` do `Flyway`, nao trate isso como ajuste trivial.

Use o documento:

- `FLYWAY-LEGACY-MIGRATION-STRATEGY.md`
- `LEGACY-DB-ROLLout-CHECKLIST.md`

Resumo operacional:

- ambiente novo: subir normalmente
- ambiente local descartavel: preferir reset controlado
- ambiente legado com dados: validar schema, backup e decidir entre `repair` controlado ou nova migration corretiva
