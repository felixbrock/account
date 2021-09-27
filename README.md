# account

------------------------------

aws ecr get-login-password --region eu-central-1 | docker login --username AWS --password-stdin 085009017826.dkr.ecr.eu-central-1.amazonaws.com

$serviceName = 'account'; $env='test'; $version = 'v1.0.6'; $previousVersion = 'v1.0.5';

$name = "085009017826.dkr.ecr.eu-central-1.amazonaws.com/${serviceName}"; npm run build; $tag = $(If ($env -eq 'production') {${version}} Else {'latest'}); docker build --build-arg "ENV=${env}" -t "${name}:${tag}" .; docker push "${name}:${tag}";

If ($env -eq 'production') {docker rmi "${name}:${previousVersion}"}; If ($env -eq 'production') {aws ecr batch-delete-image --repository-name $serviceName --image-ids "imageTag=${previousVersion}"}

If ($env -eq 'test') {aws ecs update-service --cluster hivedive-test --service "${serviceName}-service" --force-new-deployment};

------------------------------