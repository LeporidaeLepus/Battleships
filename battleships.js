var row=Math.floor(Math.random()*6+5);
var col=Math.floor(Math.random()*6+5);
var size=50;

var playingBoard=document.getElementById("playingboard");
var reSetBut=document.getElementById("but");

playingBoard.style.height=row*size+'px';
playingBoard.style.width=col*size+'px';

for(i=0;i<row;i++){
    for(j=0;j<col;j++){
        var square=document.createElement("div");
        square.id='square'+i+j;
        playingBoard.appendChild(square);

        var topPosition=i*size;
        var leftPosition=j*size;
        square.style.top=topPosition+'px';
        square.style.left=leftPosition+'px';  
    }
}

var board=new Array(row);
for(i=0;i<row;i++){
    board[i]=new Array(col);
    board[i].fill(0);
}

//船只占格总数
var number=0;

for(k=1;k<=Math.floor(Math.random()*3+1);k++){
    var place=Math.floor(Math.random()*4+1);

    number+=place;

    do{
        var direction=setPosition();
        var check=checkPosition(direction,place);
    }
    while(!check.check)

    if(direction){
        for(j=check.y;j<(place+check.y);j++) board[check.x][j]=k;
    }      
    else if(!direction){
        for(i=check.x;i<(place+check.x);i++) board[i][check.y]=k;
    }
}

var attacks=[];

//可攻击次数=船只占格数+空余格数/2（向下取整）
var times=number+Math.floor((row*col-number)/2);
//以攻击次数
var clickCount=0;
//命中次数
var success=0;

playingBoard.addEventListener("click",clickSquare,false);
reSetBut.addEventListener("click",reSet,false);



function setPosition(){
    //选择排列方向，position=1时横向，position=0时纵向
    var position=Math.floor(Math.random()*2); 
    return position;
}

function checkPosition(direction,place){
    var op={"empty":0,"check":0,"x":0,"y":0};
    if(direction){
        op.x=Math.floor(Math.random()*row);
        op.y=Math.floor(Math.random()*(col-place));
        for(j=op.y;j<(place+op.y);j++){
            if(board[op.x][j]==0) op.empty++;
        }      
    }
    else if(!direction){
        op.y=Math.floor(Math.random()*col);
        op.x=Math.floor(Math.random()*(row-place));
        for(i=op.x;i<(place+op.x);i++){
            if(board[i][op.y]==0) op.empty++;
        }
    }
    if(op.empty==place) op.check=1;
    return op;
}

function clickSquare(e){
    if(e.target!==e.currentTarget){
        var r=e.target.id.substring(6,7);
        var c=e.target.id.substring(7,8);

        if(clickCount<times){
            if((e.target.style.background!='red'&&e.target.style.background!='blue')){
                clickCount++;
                attacks.push([r,c]);
    
                if(board[r][c]==0){
                    e.target.style.background='blue';
                }   
                else{
                    e.target.style.background='red';
                    success++;

                    if (success==number){
                        var result=damagedOrSunk (board, attacks);
                        alert("Congratulation!All enemy's ships have been sunk!\nsunk="+result.sunk+" damaged="+result.damaged+" notTouched="+result.notTouched+"\npoints="+result.points);
                        //reSet();
                    }
                }
            }
            else{
                alert('You have already fired here.')
            }
        }
        else{
            var result=damagedOrSunk(board,attacks);
            alert("GameOver!\nsunk="+result.sunk+" damaged="+result.damaged+" notTouched="+result.notTouched+"\npoints="+result.points);
            //reSet();
        }
    }
    e.stopPropagation();
}

function damagedOrSunk (board, attacks){
    var output={"sunk":0,"damaged":0,"points":0,"notTouched":0};
        for(k=1;k<=3;k++){
            var count=0,fire=0;
            for(i=0;i<board.length;i++){
               for(j=0;j<board[i].length;j++){
                   if(board[i][j]==k){
                        count++; 
                       // console.log(count);
                        for(m=0;m<attacks.length;m++){
                            if ([i,j].toString()== attacks[m].toString()){
                                fire++;
                                //console.log(fire);
                            }
                        }
                   } 
                } 
            }
               if((fire==count)&&(count!=0)){
                   output.sunk++;
                   output.points++;
               }
               else if((fire<count)&&fire!=0) {
                   output.damaged++;
                   output.points=output.points+0.5;
               }
               else if((fire==0)&&count){
                   output.notTouched++;
                   output.points--;
               } 
 
        }
        return output;
}


//刷新当前页面
function reSet(){
    location.reload();
}


