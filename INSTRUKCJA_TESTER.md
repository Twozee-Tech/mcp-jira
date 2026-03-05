# Instrukcja dla testera - jak wrzucić poprawkę

## Przed pierwszym razem

Zainstaluj Git i sklonuj repozytorium (jednorazowo):

```bash
git clone https://github.com/Twozee-Tech/NAZWA-REPO.git
cd NAZWA-REPO
```

## Codzienne kroki

### 1. Przełącz się na branch developtera

Dev poda ci nazwę brancha, np. `feature/login-fix`.

```bash
git checkout feature/login-fix
```

### 2. Pobierz najnowsze zmiany

```bash
git pull
```

### 3. Popraw co trzeba

Otwórz pliki w edytorze, popraw literówki, teksty itp.

### 4. Sprawdź co zmieniłaś

```bash
git status
```

Zobaczysz listę zmienionych plików.

### 5. Dodaj pliki i zapisz poprawkę

```bash
git add .
git commit -m "Poprawka: opis co zmieniłaś"
```

Przykłady opisu:
- `"Poprawka: literówka na stronie logowania"`
- `"Poprawka: zmiana tekstu przycisku na Wyślij"`

### 6. Wypchnij na serwer

```bash
git push
```

Gotowe! Dev zobaczy twoją poprawkę w Pull Requeście i zrobi merge.

## Najczęstsze problemy

**"nie mogę się przełączyć na branch"**
```bash
git fetch
git checkout feature/login-fix
```

**"mam jakieś niezapisane zmiany"**
```bash
git stash
git checkout feature/login-fix
git stash pop
```

**"push nie działa"**
- Sprawdź czy masz uprawnienia do repo
- Sprawdź czy jesteś na dobrym branchu: `git branch`
