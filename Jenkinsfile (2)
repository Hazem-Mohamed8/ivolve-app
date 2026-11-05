pipeline {
    agent any

    environment {
        IMAGE = 'hazemmohamed4/ivolve-app'
        TAG   = "${BUILD_NUMBER}"
    }

    stages {
        stage('Build App') {
            steps {
                sh 'node -v && npm -v'
                sh 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE:$TAG .'
            }
        }

        stage('Scan Docker Image') {
            steps {
                // exit-code 0 = report only. Use 1 to fail the build on HIGH/CRITICAL findings.
                sh 'trivy image --no-progress --severity HIGH,CRITICAL --exit-code 0 $IMAGE:$TAG'
            }
        }

        stage('Push Image to DockerHub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub',
                                                  usernameVariable: 'DH_USER',
                                                  passwordVariable: 'DH_PASS')]) {
                    sh 'echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin'
                    sh 'docker push $IMAGE:$TAG'
                }
            }
        }

        stage('Delete Image Locally') {
            steps {
                sh 'docker rmi $IMAGE:$TAG'
            }
        }

        stage('Update Image in Deployment File') {
            steps {
                // only the app image is replaced; the mysql init container image is untouched
                sh 'sed -i "s|image: $IMAGE:.*|image: $IMAGE:$TAG|" k8s/deployment.yaml'
                sh 'grep -n "image:" k8s/deployment.yaml'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'k8s-kubeconfig', variable: 'KUBECONFIG')]) {
                    sh 'kubectl apply -f k8s/deployment.yaml -n ivolve'
                    sh 'kubectl rollout status deployment/ivolveapp -n ivolve --timeout=180s'
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished with status: ${currentBuild.currentResult}"
            sh 'docker logout || true'
            deleteDir()
        }
        success {
            echo "Success: ${IMAGE}:${TAG} deployed to the ivolve namespace"
        }
        failure {
            echo 'Failure: check the console output of the failed stage'
        }
    }
}
