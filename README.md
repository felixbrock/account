# account

------------------------------

Docker deployment

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 085009017826.dkr.ecr.eu-central-1.amazonaws.com

$newVersion = 1; $previousVersion = $newVersion - 1; $serviceName = 'account'; $name = "085009017826.dkr.ecr.eu-central-1.amazonaws.com/${serviceName}"; docker build -t "${name}:v1.0.${newVersion}" .; docker push "${name}:v1.0.${newVersion}"; docker rmi "${name}:v1.0.${previousVersion}"; aws ecr batch-delete-image --repository-name $serviceName --image-ids "imageTag=v1.0.${previousVersion}"

<!-- docker run -dp 8080:8080 085009017826.dkr.ecr.eu-central-1.amazonaws.com/account:v1.0.0 -->

aws ecs update-service --cluster hivedive --service account-service --force-new-deployment

------------------------------