pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = "chaussures-ci-cd"
  }

  stages {
    stage('Checkout') {
      steps {
        git branch: 'main', url: 'https://github.com/bnraed/chaussures.git'
      }
    }

    stage('Cleanup old') {
      steps {
        bat 'docker compose down -v --remove-orphans || exit 0'
      }
    }

    stage('Build') {
      steps {
        bat 'docker compose build'
      }
    }

    stage('Up') {
      steps {
        bat 'docker compose up -d'
      }
    }

    stage('Smoke test') {
      steps {
        bat 'docker compose ps'
        // optionnel: vérifier que backend répond (si tu exposes un port en CI)
      }
    }
  }

  post {
    always {
      bat 'docker compose down -v --remove-orphans || exit 0'
    }
  }
}
