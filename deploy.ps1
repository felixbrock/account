param([string]$serviceName, [string]$env, [string]$version, [string]$previousVersion)

if (-Not $serviceName) {
  $serviceName = read-host -Prompt "Please enter service name"
}
if (-Not $env) {
  $env = read-host -Prompt "Please enter environment name"
}

$productionEnv = 'production';
$testEnv = 'test';

if(-Not ($env -eq $productionEnv -or $env -eq $testEnv)) {return write-host 'environment not recognized'}

# if($env -eq $productionEnv) {
#   if(-Not $version) {
#     $version = read-host -Prompt "Please enter version to publish"
#   }
#   if(-Not $previousVersion) {
#     $previousVersion = read-host -Prompt "Please enter previous version to delete"
#   }
# } 


aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 085009017826.dkr.ecr.eu-central-1.amazonaws.com;

$name = "085009017826.dkr.ecr.eu-central-1.amazonaws.com/${serviceName}"
npm run build
$tag = $(if ($env -eq $productionEnv) {$productionEnv} else {$testEnv})
docker build --build-arg "ENV=${env}" -t "${name}:${tag}" .
docker push "${name}:${tag}"

# if ($env -eq $productionEnv) {
#   docker rmi "${name}:${previousVersion}"
#   aws ecr batch-delete-image --repository-name $serviceName --image-ids "imageTag=${previousVersion}"
# }
docker image prune -f
$imagesToDelete = aws ecr list-images --repository-name $serviceName --filter "tagStatus=UNTAGGED" --query 'imageIds[*]' --output json
$imagesToDelete = $imagesToDelete.replace('"', '""')
aws ecr batch-delete-image --repository-name $serviceName --image-ids "$imagesToDelete"

$clusterName = $(if ($env -eq $productionEnv) {'hivedive'} else {'hivedive-test'})
aws ecs update-service --cluster ${clusterName} --service "${serviceName}-service" --force-new-deployment