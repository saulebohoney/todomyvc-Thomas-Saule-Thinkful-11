CREATE TABLE items (
   id     serial  NOT NULL,
   title  text    NOT NULL,
   completed BOOLEAN DEFAULT FALSE,
   CONSTRAINT items_pkey PRIMARY KEY ( id )
   );
