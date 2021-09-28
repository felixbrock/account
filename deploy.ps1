aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 085009017826.dkr.ecr.eu-central-1.amazonaws.com;

$serviceName = 'account'
$env='test'
$version = 'v1.0.7'
$previousVersion = 'v1.0.6'

$name = "085009017826.dkr.ecr.eu-central-1.amazonaws.com/${serviceName}"
npm run build
$tag = $(if ($env -eq 'production') {${version}} else {'latest'})
docker build --build-arg "ENV=${env}" -t "${name}:${tag}" .
docker push "${name}:${tag}"

if ($env -eq 'production') {
  docker rmi "${name}:${previousVersion}"
  aws ecr batch-delete-image --repository-name $serviceName --image-ids "imageTag=${previousVersion}"
}
elseif ($env -eq 'test') {
  docker image prune -f
  $imagesToDelete = aws ecr list-images --repository-name $serviceName --filter "tagStatus=UNTAGGED" --query 'imageIds[*]' --output json
  $imagesToDelete = $imagesToDelete.replace('"', '""')
  aws ecr batch-delete-image --repository-name $serviceName --image-ids "$imagesToDelete"

  aws ecs update-service --cluster hivedive-test --service "${serviceName}-service" --force-new-deployment
}

# docker run -dp 3000:3000 085009017826.dkr.ecr.eu-central-1.amazonaws.com/selector:v1.0.0