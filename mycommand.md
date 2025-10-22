src 폴더 안에 router 폴더 만들고,
board_router.ts 라는 라우터 만들어줘.
니가 TBoard.ts 보고 파악해서,
간단한 crud 예제 만들어봐.
insert, update 얘네는 합쳐서 하나로 퉁치고,
body 로 받을때는 formdata 로 받고,
get에서 데이터 받을때는 query string 사용해.

각 라우터 try catch 로 감싸고,
status code 200으로 통일.
{
success:boolean,
data:any,
msg:string
}
형태로 읍답.
