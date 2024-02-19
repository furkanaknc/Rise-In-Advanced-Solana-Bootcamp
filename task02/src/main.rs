enum Publication {
    Book(Book),
    Magazine(Magazine)
}


struct Book{
    title:String,
    author:String,
    page_count:u32,
}

struct Magazine{
    title:String,
    issue:u32,
    topic:String,
}

fn publication_vec (publication:Vec<Publication>) {
    for _publication in publication {
        match _publication {
            Publication::Book(ref book)=>{
                println!(
                    "Book: {} -> Author: {} - {} Pages",
                    book.title, book.author, book.page_count
                );
            }
            Publication::Magazine(ref magazine) =>{
                println!(
                    "Magazine: {} -> Issue:{} - Topic:{} ",
                    magazine.title, magazine.issue, magazine.topic
                );
            }
        }
    }
}


fn main(){

    let book1 = Book {
        title: "Crime And Punishment".to_string(),
        author:"Fyodor Mihailovich Dostoyevski ".to_string(),
        page_count:	501
    };

    let book2 = Book{
        title: "Animal Farm".to_string(),
        author:"George Orwell".to_string(),
        page_count:124
    };


    let magazine1 = Magazine{
        title:"sofware magazine".to_string(),
        issue:15,
        topic:"web".to_string()
    };

    let magazine2 = Magazine{
        title:"AI magazine".to_string(),
        issue:12,
        topic:"AI industry".to_string()
    };

    let print_vec = vec![Publication::Magazine(magazine1),Publication::Magazine(magazine2),Publication::Book(book1),Publication::Book(book2)];

    publication_vec(print_vec)

}
