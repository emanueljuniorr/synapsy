# Regras do Firebase Storage

## Regras de Segurança para o Storage

Para complementar as regras do Firestore, você também precisa configurar as regras do Firebase Storage para permitir que os usuários façam upload e acessem seus próprios arquivos. Aqui estão as regras recomendadas:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Bloquear acesso por padrão
    match /{allPaths=**} {
      allow read, write: if false;
    }
    
    // Pasta de avatares de usuários
    match /users/{userId}/avatar/{fileName} {
      allow read: if request.auth != null; // Qualquer usuário autenticado pode ler avatares
      allow write: if request.auth != null && request.auth.uid == userId; // Apenas o próprio usuário pode fazer upload
    }
    
    // Pasta de anexos de notas
    match /notes/{userId}/{noteId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Pasta de imagens de flashcards
    match /flashcards/{userId}/{subjectId}/{flashcardId}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Arquivos públicos (se necessário)
    match /public/{fileName} {
      allow read: if request.auth != null;
      allow write: if false; // Bloquear escrita em arquivos públicos
    }
  }
}
```

## Como aplicar estas regras:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e selecione seu projeto
2. No menu lateral, clique em "Storage"
3. Clique na aba "Regras"
4. Substitua o conteúdo atual pelas regras acima
5. Clique em "Publicar"

## Regras Temporárias para Desenvolvimento

Se estiver encontrando problemas, você pode usar temporariamente estas regras mais permissivas durante o desenvolvimento:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

⚠️ **IMPORTANTE**: Assim como as regras do Firestore, estas regras temporárias são APENAS para desenvolvimento e devem ser substituídas por regras mais seguras antes de entrar em produção. 