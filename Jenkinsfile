pipeline {
  agent any

  environment {
    DOCKERHUB_NAMESPACE = "raedbn"
    BACKEND_REPO = "chaussures-backend"
    FRONTEND_REPO = "chaussures-frontend"

    BACKEND_IMAGE  = "${DOCKERHUB_NAMESPACE}/${BACKEND_REPO}:latest"
    FRONTEND_IMAGE = "${DOCKERHUB_NAMESPACE}/${FRONTEND_REPO}:latest"
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
        '''
      }
    }

    stage("Detect built image IDs (from compose)") {
      steps {
        bat '''
          REM Récupère les IDs d'images buildées par compose
          FOR /F "usebackq delims=" %%i IN (`docker compose images -q backend`) DO SET BACKEND_LOCAL_ID=%%i
          FOR /F "usebackq delims=" %%i IN (`docker compose images -q frontend`) DO SET FRONTEND_LOCAL_ID=%%i

          echo BACKEND_LOCAL_ID=%BACKEND_LOCAL_ID%
          echo FRONTEND_LOCAL_ID=%FRONTEND_LOCAL_ID%

          IF "%BACKEND_LOCAL_ID%"=="" (
            echo ERROR: Impossible de trouver l'image backend via "docker compose images -q backend"
            exit /b 1
          )

          IF "%FRONTEND_LOCAL_ID%"=="" (
            echo ERROR: Impossible de trouver l'image frontend via "docker compose images -q frontend"
            exit /b 1
          )
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
          echo Tag backend -> %BACKEND_IMAGE%
          docker tag %BACKEND_LOCAL_ID% %BACKEND_IMAGE%
          docker push %BACKEND_IMAGE%

          echo Tag frontend -> %FRONTEND_IMAGE%
          docker tag %FRONTEND_LOCAL_ID% %FRONTEND_IMAGE%
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
