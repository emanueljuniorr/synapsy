# Configuração do Firebase para o Synapsy

## Problema de Permissões

Os erros "Missing or insufficient permissions" indicam que as regras de segurança do Firestore não estão permitindo que o cliente acesse os dados. Para resolver este problema, siga as instruções abaixo para atualizar as regras de segurança.

## Atualização das Regras de Segurança do Firestore

1. Acesse o [Console do Firebase](https://console.firebase.google.com/) e selecione seu projeto "synapsy-app"

2. No menu lateral, clique em "Firestore Database"

3. Clique na aba "Regras"

4. Substitua todo o conteúdo atual pelas regras a seguir:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regra básica para bloquear acesso não autenticado
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Usuários podem ler e escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Coleção de tarefas - usuários podem gerenciar suas próprias tarefas
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Coleção de notas - usuários podem gerenciar suas próprias notas
    match /notes/{noteId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Coleção de assuntos para estudo
    match /subjects/{subjectId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Coleção de flashcards
    match /flashcards/{flashcardId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.createdBy == request.auth.uid);
      allow create: if request.auth != null && 
        (request.resource.data.userId == request.auth.uid || 
         request.resource.data.createdBy == request.auth.uid);
    }
    
    // Coleção de sessões de estudo
    match /studySessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Coleção de assinaturas - usuários podem ler suas próprias assinaturas
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Regra especial para documentos que não existem ainda e podem dar erro na checagem resource.data
    match /{path=**}/{document} {
      allow read: if resource == null && request.auth != null;
    }
  }
}
```

5. Clique em "Publicar" para aplicar as novas regras

## Explicação das Regras

Estas regras seguem o princípio de segurança de "acesso com privilégio mínimo":

1. Bloqueio geral: Bloqueamos todo o acesso por padrão
2. Acesso por usuário: Permitimos que usuários acessem apenas seus próprios dados
3. Acesso por documento: Cada documento tem regras específicas baseadas no campo `userId`
4. Regra de fallback: Temos uma regra especial para lidar com documentos que não existem ainda

## Outros Ajustes Necessários

Além das regras do Firestore, certifique-se de que:

1. A autenticação do Firebase está configurada corretamente
2. As variáveis de ambiente do Firebase estão definidas adequadamente
3. Os tokens de ID estão sendo corretamente propagados

## Verificando se as Regras Funcionaram

Após aplicar as regras, os erros "Missing or insufficient permissions" devem desaparecer e a aplicação deve funcionar normalmente. 