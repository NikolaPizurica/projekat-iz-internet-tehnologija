create database it2020;

use it2020;

create table Avatar (
	img_path varchar(100) primary key
);

create table Participant (
	id int auto_increment,
    mail varchar(100) not null,
    primary key(id),
    unique (mail)
);

create table Bot (
	id int,
    bot_name varchar(100) not null,
    bot_desc text not null,
    rest_endpoint varchar(100) not null,
    avi_path varchar(100),
    primary key (id),
    foreign key (id) references Participant(id),
    foreign key (avi_path) references Avatar(img_path)
);

create table EndUser (
	id int,
    username varchar(100) not null,
    pass char(128) not null, -- sha512 hash
    avi_path varchar(100),
    primary key (id),
    foreign key (id) references Participant(id),
    foreign key (avi_path) references Avatar(img_path)
);

create table Chat (
	chat_num bigint auto_increment,
    title varchar(100) not null,
    chat_date date not null,
    user_id int not null,
    primary key (chat_num),
    foreign key (user_id) references EndUser(id)
);

create table Message (
	msg_num bigint auto_increment,
    content text not null,
    msg_time time not null,
    part_id int not null,
    chat_num bigint not null,
    primary key (msg_num),
    foreign key (part_id) references Participant(id),
    foreign key (chat_num) references Chat(chat_num)
);