alter table Bot drop foreign key bot_ibfk_2;
alter table Bot drop column avi_path;
alter table EndUser drop foreign key enduser_ibfk_2;
alter table EndUser drop column avi_path;
drop table Avatar;
alter table Participant add column avi_path varchar(200);
alter table EndUser modify column pass char(94) not null;