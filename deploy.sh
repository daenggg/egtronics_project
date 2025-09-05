#!/bin/bash

# ======================================================
# React/Next.js Docker 배포 자동화 스크립트
# 사용법: ./deploy.sh
# ======================================================

# --- 설정 변수 (사용자 환경에 맞게 수정) ---

# 1. 로컬에서 사용할 Docker 이미지 이름
IMAGE_NAME="eg-front"

# 2. 원격 서버 접속 정보
REMOTE_USER="egtronics"
REMOTE_HOST="192.168.0.101"

# 3. 서버에 배포할 경로 (*** 수정된 부분 ***)
REMOTE_DEPLOY_PATH="/opt/egtronics/front-end"

# 4. 서버에서 실행할 컨테이너 이름
CONTAINER_NAME="eg-front-container"

# 5. 포트 설정 (서버 포트:컨테이너 포트)
PORT_MAPPING="3000:3000"


# --- 스크립트 시작 ---
echo " 배포를 시작합니다: $IMAGE_NAME"

# 1. [로컬] Docker 이미지 빌드
echo " (1/4) Docker 이미지를 빌드합니다..."
docker build -t $IMAGE_NAME .
if [ $? -ne 0 ]; then echo "  [오류] Docker 이미지 빌드에 실패했습니다."; exit 1; fi

# 2. [로컬] 이미지를 .tar 파일로 저장
echo " (2/4) 이미지를 .tar 파일로 저장합니다..."
docker save -o $IMAGE_NAME.tar $IMAGE_NAME
if [ $? -ne 0 ]; then echo "  [오류] 이미지를 파일로 저장하는 데 실패했습니다."; exit 1; fi

# 3. [로컬] scp를 이용해 서버의 지정된 경로로 이미지 파일 전송 (*** 수정된 부분 ***)
echo " (3/4) scp를 통해 서버($REMOTE_DEPLOY_PATH)로 이미지 파일을 전송합니다..."
scp ./$IMAGE_NAME.tar $REMOTE_USER@$REMOTE_HOST:$REMOTE_DEPLOY_PATH/
if [ $? -ne 0 ]; then echo "  [오류] 서버로 파일을 전송하는 데 실패했습니다."; exit 1; fi

# 4. [서버] 원격 스크립트 실행 (*** 수정된 부분 ***)
echo " (4/4) 서버에서 배포 스크립트를 실행합니다..."
ssh $REMOTE_USER@$REMOTE_HOST << EOF
    # 서버에서 실행될 명령어들

    echo "  (서버) 배포 경로로 이동합니다: $REMOTE_DEPLOY_PATH"
    cd $REMOTE_DEPLOY_PATH

    echo "  (서버) 이미지 파일을 로드합니다: $IMAGE_NAME.tar"
    sudo docker load -i $IMAGE_NAME.tar

    echo "  (서버) 기존 컨테이너를 중지/삭제합니다: $CONTAINER_NAME"
    sudo docker stop $CONTAINER_NAME || true
    sudo docker rm $CONTAINER_NAME || true

    echo "  (서버) 새 컨테이너를 실행합니다."
    # 백엔드 주소를 환경 변수로 전달
    sudo docker run -d -p $PORT_MAPPING -e NEXT_PUBLIC_API_URL=http://$REMOTE_HOST --restart always --name $CONTAINER_NAME $IMAGE_NAME

    echo "  (서버) 사용하지 않는 Docker 이미지를 정리합니다."
    sudo docker image prune -f

    echo "  배포가 완료되었습니다! http://$REMOTE_HOST:$PORT_MAPPING 으로 접속하여 확인하세요."
EOF

# 로컬에 생성된 .tar 파일 삭제
echo " 로컬 임시 파일($IMAGE_NAME.tar)을 삭제합니다."
rm ./$IMAGE_NAME.tar

echo " 모든 과정이 성공적으로 완료되었습니다."