/* 随机生成网格行列 */
var row=Math.floor(Math.random()*6+5);
var col=Math.floor(Math.random()*6+5);
var size=50;

var playingBoard=document.getElementById("playingboard");
var reSetBut=document.getElementById("but");

/* 设置网格大小 */
playingBoard.style.height=row*size+'px';
playingBoard.style.width=col*size+'px';

/* 每一格创建一个新的div，添加到最后一个子节点后，并令其id=square+行+列*/
for(i=0;i<row;i++){
    for(j=0;j<col;j++){
        var square=document.createElement("div");
        square.id='square'+i+j;
        playingBoard.appendChild(square);

        /* 设置每一格大小，并使其排列成一个矩形 */
        var topPosition=i*size;
        var leftPosition=j*size;
        square.style.top=topPosition+'px';
        square.style.left=leftPosition+'px';  
    }
}

/* 建立与网格行列相等的数列，并使其全部初始化为0 */
var board=new Array(row);
for(i=0;i<row;i++){
    board[i]=new Array(col);
    board[i].fill(0);
}

/* 船只占格总数 */
var number=0;

/* 随机生成1-3中一个数，作为船只数量 */
for(k=1;k<=Math.floor(Math.random()*3+1);k++){
    /* 随机生成1-4中一个数作为该船只所占格数 */
    var place=Math.floor(Math.random()*4+1);

    number+=place;

    /* 执行setPosition（）生成起始位置，执行checkPosition（）判断船只能否放下 ，若不能放下则重新选择位置*/
    do{
        var direction=setPosition();
        var check=checkPosition(direction,place);
    }
    while(!check.check)

    /* 将船只所在格对应的数组值更改为代表该船只的数k */
    if(direction){
        for(j=check.y;j<(place+check.y);j++) board[check.x][j]=k;
    }      
    else if(!direction){
        for(i=check.x;i<(place+check.x);i++) board[i][check.y]=k;
    }
}

/* 被攻击区域代表的坐标 */
var attacks=[];

/* 可攻击次数=船只占格数+空余格数/2（向下取整） */
var times=number+Math.floor((row*col-number)/2);
/* 以攻击次数 */
var clickCount=0;
/* 命中次数 */
var success=0;

/* 当监听到网格被点击时执行clickSquare（） */
playingBoard.addEventListener("click",clickSquare,false);
/* 当监听到按钮被点击时执行reSet（） */
reSetBut.addEventListener("click",reSet,false);



function setPosition(){
    //选择排列方向，position=1时横向，position=0时纵向
    var position=Math.floor(Math.random()*2); 
    return position;
}


function checkPosition(direction,place){
    var op={"empty":0,"check":0,"x":0,"y":0};
    /* 船只横向排列时 */
    if(direction){
        op.x=Math.floor(Math.random()*row);  //随机生成起始坐标的x
        op.y=Math.floor(Math.random()*(col-place));  //随机生成起始坐标的y，y的坐标一定使所在行能放下该船只

        /* 检测该位置下船只所占的格是否都为空，若为空则empty++ */
        for(j=op.y;j<(place+op.y);j++){
            if(board[op.x][j]==0) op.empty++;
        }      
    }
    /* 船只纵向排列 */
    else if(!direction){
        op.y=Math.floor(Math.random()*col); //随机生成起始坐标的y
        op.x=Math.floor(Math.random()*(row-place));  //随机生成起始坐标的x，x的坐标一定使所在列能放下该船只

        /* 检测该位置下船只所占的格是否都为空，若为空则empty++ */
        for(i=op.x;i<(place+op.x);i++){
            if(board[i][op.y]==0) op.empty++;
        }
    }

    /* 如果empty和place相等即为该船只在该位置所占格皆为空，check=1表示能放下，check=0表示不能 */
    if(op.empty==place) op.check=1;

    return op;
}

function clickSquare(e){
    /* 当有新的点击产生 */
    if(e.target!==e.currentTarget){
        /* 通过id使每一格与数组的每一格元素一一对应 */
        var r=e.target.id.substring(6,7);
        var c=e.target.id.substring(7,8);

        /* 当已点击次数在规定范围内且所有船只没有都被击沉时，游戏可以继续点击 */
        if(clickCount<times&&success!=number){
            /* 点击的格子没有被点击过 */
            if((e.target.style.background!=' rgb(218, 125, 38)'&&e.target.style.background!='rgba(86, 133, 86, 0.863)')){
                clickCount++;  //总点击数+1
                attacks.push([r,c]);  //将该格对应的数组加入attacks
    
                /* 该格没有船只 */
                if(board[r][c]==0){
                    e.target.style.background='rgba(86, 133, 86, 0.863)'; //green
                } 
                /* 该格有船只 */  
                else{
                    e.target.style.background=' rgb(218, 125, 38)'; //orange;
                    success++;

                    /* 所有船只都被击沉，判断游戏结果并通过弹窗输出 */
                    if (success==number){
                        var result=damagedOrSunk (board, attacks);  
                        alert("Congratulation!All enemy's ships have been sunk!\nsunk="+result.sunk+" damaged="+result.damaged+" notTouched="+result.notTouched+"\npoints="+result.points);
                        //reSet();
                    }
                }
            }
            /* 该格子已经被点击过 */
            else{
                alert('You have already fired here.')
            }
        }
        /* 所有船只都被击沉 */
        else if(success==number){
            alert("All enemy's ships have been sunk!");
        }
        /* 点击次数超过限定次数，游戏结束，判断游戏结果并通过弹窗输出 */
        else{
            var result=damagedOrSunk(board,attacks);
            alert("GameOver!\nsunk="+result.sunk+" damaged="+result.damaged+" notTouched="+result.notTouched+"\npoints="+result.points);
            //reSet();
        }
    }
    e.stopPropagation();
}


/* 判断游戏结果 */
function damagedOrSunk (board, attacks){
    var output={"sunk":0,"damaged":0,"points":0,"notTouched":0};
        for(k=1;k<=3;k++){
            /* 如果存在k代表的船只则count表示船只所占格数，否则count=0；
               fire表示船只被攻击的格子数 */
            var count=0,fire=0;  
            for(i=0;i<board.length;i++){
               for(j=0;j<board[i].length;j++){
                   if(board[i][j]==k){
                        count++; 
                       // console.log(count);

                       /* 判断该船是否被攻击及攻击状况 */
                        for(m=0;m<attacks.length;m++){
                            if ([i,j].toString()== attacks[m].toString()){
                                fire++;
                                //console.log(fire);
                            }
                        }
                   } 
                } 
            }
                /* 船只存在并且全部被攻击-->sunk，加1分*/
               if((fire==count)&&(count!=0)){
                   output.sunk++;
                   output.points++;
               }
               /* 船只被攻击但未击沉-->damaged，加0.5分 */
               else if((fire<count)&&fire!=0) {
                   output.damaged++;
                   output.points=output.points+0.5;
               }
               /* 船只存在并且未被攻击-->notTouched，减1分 */
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


