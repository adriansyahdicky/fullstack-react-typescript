import { Arg, Ctx, Resolver, Mutation, InputType, Field, ObjectType } from "type-graphql";
import { MyContext } from "../../types";
import { Users } from "../entities/Users";
import argon2 from 'argon2'
import { UniqueConstraintViolationException } from "@mikro-orm/core";

@InputType()
class UsernamePasswordInput{
    @Field()
    username!: string
    @Field()
    password!: string;
}

@ObjectType()
class FieldError{
    @Field()
    field?: string;
    @Field()
    message?: string;
}

@ObjectType()
class UserResponse{
    @Field(() => [FieldError], {nullable:true})
    errors?: FieldError[]

    @Field(() => Users, {nullable: true})
    user?: Users
}

@Resolver()
export class UserResolver{

    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext): Promise<UserResponse> {
       
       if(options.username.length <= 2){
        return {
            errors: [{
                field: "username",
                message: "username must be greater than 2"
            }]
        }
       }

       if(options.password.length <= 2){
        return {
            errors: [{
                field: "password",
                message: "password must be greater than 2"
            }]
        }
       }
       
       const hashedPassword = await argon2.hash(options.password);
       const user = em.create(Users, {
           createdAt: new Date(),
           updatedAt: new Date(),
           username: options.username,
           password: hashedPassword
       });

       try{
            await em.persistAndFlush(user);
       }catch (err : unknown){
            const codeUniqueConstraint = err as UniqueConstraintViolationException
            if(codeUniqueConstraint.code === '23505'){
                return{
                    errors:[{
                        field: "username",
                        message: "username already exists"
                    }]
                }
            }
       }
       return {user};
    }


    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() {em}: MyContext): Promise<UserResponse> {
       const user = await em.findOne(Users, {username: options.username});
       if (!user){
        return{
            errors: [{
                field: "username",
                message: "that username doesn't exists",
            },
            ],
        };
       }
       const valid = await argon2.verify(user.password, options.password);
       if(!valid){
        return{
            errors: [{
                field: "password",
                message: "incorrect password",
            },
            ],
        };
       }

       return {
        user
       }
       
    }


}