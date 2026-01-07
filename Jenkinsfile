pipeline {
  agent any

  environment {
    COMPOSE_PROJECT_NAME = "chaussures-ci-cd"
    DOCKERHUB_NAMESPACE = "raedbn"
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

    stage('Build Images') {
      steps {
        bat 'docker compose build'
      }
    }

    // 🔐 CI Security
    stage('Trivy Scan') {
      steps {
        bat '''
          trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 chaussures-ci-cd-backend:latest
          trivy image --severity HIGH,CRITICAL --ignore-unfixed --exit-code 1 chaussures-ci-cd-frontend:latest
        '''
      }
    }

    // 🚀 CD : Push DockerHub
    stage('Push to DockerHub') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-raedbn',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          bat '''
            echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin

            docker tag chaussures-ci-cd-backend:latest %DOCKERHUB_NAMESPACE%/chaussures-backend:latest
            docker tag chaussures-ci-cd-frontend:latest %DOCKERHUB_NAMESPACE%/chaussures-frontend:latest

            docker push %DOCKERHUB_NAMESPACE%/chaussures-backend:latest
            docker push %DOCKERHUB_NAMESPACE%/chaussures-frontend:latest
          '''
        }
      }
    }

    stage('Run Containers') {
      steps {
        bat 'docker compose up -d'
      }
    }

    stage('Smoke Test') {
      steps {
        bat 'docker compose ps'
      }
    }
  }

  post {
    always {
      bat 'docker compose down -v --remove-orphans || exit 0'
    }
  }
}
