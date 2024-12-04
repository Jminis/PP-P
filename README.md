# Sejong Univ. Opensource Software team2
- Team Name : PP:P (Protect Package :P)
- Team Member : Kim jaemin(👑), Oh JeongHyeon, Hwang HyeKyung, Afeq Fikri

# DEMO
If you want to demonstrate the demo, follow the steps below:

### STEP 1. run `quick_demo.sh`
  
```
./quick_demo.sh
```
### STEP 2. request POST message to localhost
  
```
curl -X POST \
  -H 'X-M2M-Origin:CstorageAE' \
  -H 'X-M2M-RI:req-storage-arrived' \
  -H 'X-M2M-RVI:3' \
  -H 'Content-Type:application/json;ty=4' \
  -H 'Accept:application/json' \
  -d '{
    "m2m:cin": {
      "con": "{\"status\": \"arrived\"}"
    }
  }' \
  http://localhost:8082/cse-mn/storageAE/arrived
```
### STEP 3. browse `127.0.0.1:3000`
![1](https://github.com/user-attachments/assets/adce52bf-b2e8-4903-97db-42d90c5a0d2f)
![2](https://github.com/user-attachments/assets/29e05604-f7e6-46c0-a68e-a6d2a180fbb3)

