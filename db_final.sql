create table Administrator (
	id int,
    primary key (id),
    foreign key (id) references EndUser(id)
);

create table Notification (
	id int auto_increment,
    bot_id int not null,
    ts timestamp not null,
    primary key (id),
    foreign key (bot_id) references Bot(id)
);