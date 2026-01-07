pipeline {
  agent any

  environment {
    DOCKERHUB_NAMESPACE = "raedbn"

    // noms locaux créés par docker compose build (vu dans ton log)
    LOCAL_BACKEND_IMAGE  = "chaussures-ci-cd-backend:latest"
    LOCAL_FRONTEND_IMAGE = "chaussures-ci-cd-frontend:latest"

    BACKEND_IMAGE  = "${DOCKERHUB_NAMESPACE}/chaussures-backend:latest"
    FRONTEND_IMAGE = "${DOCKERHUB_NAMESPACE}/chaussures-frontend:latest"
  }

  stages {

    stage("Checkout") {
      steps { checkout scm }
    }

    stage("Cleanup old containers") {
      steps {
        bat '''
          docker compose down --remove-orphans
        '''
      }
    }

    stage("Build images (docker compose)") {
      steps {
        bat '''
          docker compose build
          docker images | findstr chaussures
        '''
      }
    }

    stage("Login DockerHub") {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          bat '''
            echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin
          '''
        }
      }
    }

    stage("Tag & Push images") {
      steps {
        bat '''
          docker tag %LOCAL_BACKEND_IMAGE%  %BACKEND_IMAGE%
          docker tag %LOCAL_FRONTEND_IMAGE% %FRONTEND_IMAGE%

          docker push %BACKEND_IMAGE%
          docker push %FRONTEND_IMAGE%
        '''
      }
    }

    stage("Security Scan (Trivy)") {
      steps {
        bat '''
          if not exist reports mkdir reports

          echo ==== TRIVY BACKEND (%BACKEND_IMAGE%) ==== > reports\\trivy-backend.txt
          trivy image --severity HIGH,CRITICAL --no-progress %BACKEND_IMAGE% >> reports\\trivy-backend.txt

          echo ==== TRIVY FRONTEND (%FRONTEND_IMAGE%) ==== > reports\\trivy-frontend.txt
          trivy image --severity HIGH,CRITICAL --no-progress %FRONTEND_IMAGE% >> reports\\trivy-frontend.txt
        '''
      }
    }

    stage("Run (CI)") {
      steps {
        bat '''
          docker compose up -d
          docker compose ps
        '''
      }
    }

    stage("Smoke Test") {
      steps {
        bat '''
          docker compose ps
        '''
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'reports/*.txt', fingerprint: true
      bat '''
        docker compose down --remove-orphans
      '''
    }
  }
}
